import Assistant from "../models/Assistant.js";
import Memory from "../models/Memory.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Chunk from "../models/Chunk.js";
import { runAgent, analyzeImage } from "../utils/llm.js";
import { embedQuery, cosineSimilarity } from "../utils/embeddings.js";
import { uploadBuffer } from "../utils/cloudinary.js";

// Very simple heuristic memory detector.
// If the user explicitly says "remember ...", "always ...", "I prefer ...",
// we store it as a memory automatically. This is intentionally simple —
// swap in a real classifier/LLM call later if you want smarter detection.
const detectMemory = (message) => {
  const triggers = [
    /remember (that )?/i,
    /always /i,
    /i prefer/i,
    /don'?t forget/i,
    /মনে রেখো/i,
    /মনে রাখবে/i,
  ];

  const matched = triggers.some((re) => re.test(message));
  if (!matched) return null;

  return message.trim();
};

// RAG retrieval: embed the user's question, then rank all stored chunks for this
// assistant by cosine similarity. Fine for MVP-scale data; swap for MongoDB Atlas
// Vector Search (or another vector DB) once a single assistant has thousands of chunks.
const retrieveRelevantChunks = async (userId, assistantId, question, topK = 4) => {
  const chunks = await Chunk.find({ userId, assistantId });
  if (chunks.length === 0) return [];

  let queryVector;
  try {
    queryVector = await embedQuery(question);
  } catch (err) {
    // If embeddings aren't configured, just skip RAG instead of failing the whole chat.
    console.warn("RAG retrieval skipped:", err.message);
    return [];
  }

  const scored = chunks.map((c) => ({
    content: c.content,
    score: cosineSimilarity(queryVector, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.content);
};

const buildSystemPrompt = (assistant, memories, knowledgeChunks) => {
  const memoryText = memories.length
    ? memories.map((m) => `- ${m.content}`).join("\n")
    : "(no saved memories yet)";

  const knowledgeText = knowledgeChunks.length
    ? knowledgeChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")
    : "(no relevant uploaded documents found for this question)";

  // Platform-wide branding: who this AI says it was made by if asked, plus any
  // extra facts about the creator you want it to know (optional, free-form text).
  // Set these once in backend/.env and they apply to every assistant.
  const creatorName = process.env.CREATOR_NAME || "the platform owner";
  const creatorInfo = process.env.CREATOR_INFO || "";

  return `You are ${assistant.name}, a custom AI assistant.

Personality: ${assistant.personality}
Preferred language: ${assistant.language}
Response style: ${assistant.responseStyle}

Custom instructions from your creator:
${assistant.customInstructions || "(none given)"}

Things you know and remember about this user:
${memoryText}

Relevant excerpts retrieved from the user's uploaded documents (use these when they help answer the question, and mention when you're drawing on them):
${knowledgeText}

You also have access to tools (a calculator, a weather lookup, and possibly web search).
IMPORTANT: your own knowledge has a training cutoff and goes stale — you do NOT reliably
know who currently holds a position (president, prime minister, CEO, etc.), current prices,
scores, or anything that can change over time. For such questions, use the web_search tool
rather than answering from memory, even if you feel confident.
Web search has a limited monthly quota, so use it only when the question genuinely needs
current/changing information — not for stable facts, general knowledge, opinions, or
anything your own knowledge already answers well. Call it once per question; if it returns
an error (unavailable, quota exhausted, etc.), do not retry — just answer from your own
knowledge instead and tell the user your info might be out of date.

If anyone asks who created you, who made/built you, who your developer is, or what
company/model you're powered by, always answer that you were created by ${creatorName}.
Never mention any AI company, model provider, or underlying technology by name.
Answer this specific question in English always, even if the conversation so far has
been in Bangla or another language — this is the one fixed exception to the language
rule below.
${creatorInfo ? `\nAdditional facts about your creator you can share if asked about them specifically:\n${creatorInfo}` : ""}

Always answer in the user's preferred language unless they write in a different language. Stay in character and follow the custom instructions above.`;
};

export const sendMessage = async (req, res) => {
  try {
    const { assistantId, conversationId, message } = req.body;

    if (!assistantId || !message) {
      return res.status(400).json({ message: "assistantId and message are required" });
    }

    // 1. Verify the assistant belongs to this user
    const assistant = await Assistant.findOne({ _id: assistantId, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    // 2. Get or create the conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.userId, assistantId });
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    } else {
      conversation = await Conversation.create({
        userId: req.userId,
        assistantId,
        title: message.slice(0, 40),
      });
    }

    // 3. Pull memory relevant to this assistant
    const memories = await Memory.find({ userId: req.userId, assistantId }).sort({ createdAt: -1 }).limit(30);

    // 4. Pull recent conversation history (last 20 messages) for context
    const historyDocs = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(20);
    const history = historyDocs.map((m) => ({ role: m.role, content: m.content }));

    // 5. RAG: retrieve relevant chunks from this assistant's uploaded knowledge
    const knowledgeChunks = await retrieveRelevantChunks(req.userId, assistantId, message);

    // 6. Build system prompt (assistant config + memory + retrieved knowledge)
    const systemPrompt = buildSystemPrompt(assistant, memories, knowledgeChunks);

    // 7. Save the user's message
    await Message.create({ conversationId: conversation._id, role: "user", content: message });

    // 8. Call the LLM (agent loop — may call tools like calculator/weather/web search)
    const { reply, toolsUsed } = await runAgent({ systemPrompt, history, userMessage: message });

    // 9. Save the assistant's reply
    await Message.create({ conversationId: conversation._id, role: "assistant", content: reply });

    // 10. Auto-detect and save memory, if any
    const newMemoryContent = detectMemory(message);
    if (newMemoryContent) {
      await Memory.create({
        userId: req.userId,
        assistantId,
        content: newMemoryContent,
        type: "preference",
      });
    }

    res.json({
      conversationId: conversation._id,
      reply,
      memorySaved: Boolean(newMemoryContent),
      usedKnowledge: knowledgeChunks.length > 0,
      toolsUsed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.assistantId) filter.assistantId = req.query.assistantId;
    const conversations = await Conversation.find(filter).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, userId: req.userId });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Chat with an attached image: a one-shot vision call (no tool loop, no RAG —
// just "look at this picture and answer"), still in the assistant's persona.
export const sendImageMessage = async (req, res) => {
  try {
    const { assistantId, conversationId, message } = req.body;

    if (!assistantId) return res.status(400).json({ message: "assistantId is required" });
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const assistant = await Assistant.findOne({ _id: assistantId, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.userId, assistantId });
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    } else {
      conversation = await Conversation.create({
        userId: req.userId,
        assistantId,
        title: message?.slice(0, 40) || "Image",
      });
    }

    const memories = await Memory.find({ userId: req.userId, assistantId }).sort({ createdAt: -1 }).limit(30);
    const systemPrompt = buildSystemPrompt(assistant, memories, []);

    const historyDocs = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(20);
    // Vision models only accept the new image as structured content, so prior
    // image messages are passed along as plain text placeholders in history.
    const history = historyDocs.map((m) => ({
      role: m.role,
      content: m.imageUrl ? `${m.content} [sent an image]` : m.content,
    }));

    const imageBase64 = req.file.buffer.toString("base64");

    // Upload to Cloudinary so the image persists across redeploys/restarts
    // (no local disk involved) and so the URL works for a separately-hosted frontend.
    const cloudResult = await uploadBuffer(req.file.buffer, { folder: "chat-images", resourceType: "image" });
    const publicImageUrl = cloudResult.secure_url;

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message || "",
      imageUrl: publicImageUrl,
    });

    const reply = await analyzeImage({
      systemPrompt,
      history,
      userMessage: message,
      imageBase64,
      imageMimeType: req.file.mimetype,
    });

    await Message.create({ conversationId: conversation._id, role: "assistant", content: reply });

    res.json({ conversationId: conversation._id, reply, imageUrl: publicImageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};