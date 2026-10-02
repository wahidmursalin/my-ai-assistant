import Assistant from "../models/Assistant.js";
import Memory from "../models/Memory.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createAssistant = async (req, res) => {
  try {
    const { name, description, personality, language, responseStyle, customInstructions } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const assistant = await Assistant.create({
      userId: req.userId,
      name,
      description,
      personality,
      language,
      responseStyle,
      customInstructions,
    });

    res.status(201).json(assistant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssistants = async (req, res) => {
  try {
    const assistants = await Assistant.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(assistants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssistantById = async (req, res) => {
  try {
    const assistant = await Assistant.findOne({ _id: req.params.id, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });
    res.json(assistant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// "Teach AI" — update personality/instructions, optionally add a memory in the same call
export const teachAssistant = async (req, res) => {
  try {
    const { personality, language, customInstructions, rememberThis } = req.body;

    const assistant = await Assistant.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(personality !== undefined && { personality }),
        ...(language !== undefined && { language }),
        ...(customInstructions !== undefined && { customInstructions }),
      },
      { new: true }
    );

    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    if (rememberThis && rememberThis.trim()) {
      await Memory.create({
        userId: req.userId,
        assistantId: assistant._id,
        content: rememberThis.trim(),
        type: "instruction",
      });
    }

    res.json(assistant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAssistant = async (req, res) => {
  try {
    const assistant = await Assistant.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    // cascade cleanup
    await Memory.deleteMany({ assistantId: assistant._id, userId: req.userId });
    const conversations = await Conversation.find({ assistantId: assistant._id, userId: req.userId });
    const convIds = conversations.map((c) => c._id);
    await Message.deleteMany({ conversationId: { $in: convIds } });
    await Conversation.deleteMany({ assistantId: assistant._id, userId: req.userId });

    res.json({ message: "Assistant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
