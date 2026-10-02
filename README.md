# Custom AI Assistant Platform — V1 + V2 (RAG) + V3 (Tools/Agents) + V4 (Voice)

একটা multi-user platform যেখানে প্রত্যেক user নিজের AI assistant বানাতে পারে,
তাকে personality/instructions দিয়ে "teach" করতে পারে, কিছু মনে রাখতে বলতে পারে,
এবং তার সাথে chat করতে পারে। এই version-এ যা আছে:

- ✅ Register / Login (JWT auth)
- ✅ একাধিক AI Assistant তৈরি (নাম, personality, language, response style, custom instructions)
- ✅ "Teach AI" screen — behavior update + নতুন memory যোগ
- ✅ Memory system — save / list / delete, `remember that...` বললে auto-save
- ✅ Chat — assistant config + memory + conversation history + retrieved knowledge দিয়ে context assemble করে LLM call করে
- ✅ User isolation — সব query userId দিয়ে verify হয়
- ✅ **(V2) RAG** — প্রতিটা assistant-এর জন্য আলাদাভাবে PDF upload করা যায়; backend সেটা
  text-এ extract করে, chunk করে, প্রতিটা chunk-এর embedding বানায় (Voyage AI), এবং database-এ রাখে।
  Chat করার সময় প্রশ্নের embedding বানিয়ে সবচেয়ে relevant chunk-গুলো খুঁজে বের করে
  system prompt-এ inject করে দেয়।
- ✅ **(V3) Tools / Agents** — assistant এখন প্রয়োজনে tool call করতে পারে:
  - `calculator` — সত্যিকারের arithmetic (কোনো key লাগে না)
  - `get_weather` — বর্তমান আবহাওয়া, Open-Meteo দিয়ে (কোনো key লাগে না)
  - `web_search` — সাম্প্রতিক তথ্যের জন্য (Tavily key দিলে চালু হয়, না দিলে tool-টাই skip হয়ে যায়)

  Backend Anthropic-এর native tool-use loop চালায়: model tool call করলে backend সেটা execute
  করে result ফেরত পাঠায়, যতক্ষণ না model একটা চূড়ান্ত text answer দেয়।
- ✅ **(V4) Voice** — browser-এর native Web Speech API ব্যবহার করে (কোনো backend/API key লাগে না):
  - 🎤 mic বাটনে চাপ দিয়ে কথা বললে সেটা automatically text-এ convert হয়ে পাঠিয়ে দেয়
  - 🔊 প্রতিটা AI reply-র পাশে play বাটন আছে, আর চাইলে "Auto-speak replies" চালু করে
    রাখলে প্রতিটা reply automatically পড়ে শোনাবে
  - assistant-এর "language" setting অনুযায়ী সঠিক accent/language ব্যবহার করে (English, Bangla, Hindi, Spanish)

এই চারটা মিলিয়ে original roadmap-এর পুরো V1–V4 সম্পূর্ণ হলো। এরপর বাকি থাকে
Fine-tuning, Subscription, Analytics, Team sharing — এগুলো production-এ যাওয়ার আগে
দরকার হলে যোগ করা যাবে।

## Project structure

```
custom-ai-platform/
├── backend/     Express + MongoDB API
└── frontend/    React + Vite + Tailwind UI
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

`.env` ফাইলে এগুলো ঠিক করো:

- `MONGO_URI` — local MongoDB (`mongodb://127.0.0.1:27017/custom-ai-platform`)
  অথবা MongoDB Atlas connection string
- `JWT_SECRET` — যেকোনো লম্বা random string
- `ANTHROPIC_API_KEY` — https://console.anthropic.com থেকে নিজের API key নাও
  (চাইলে `backend/src/utils/llm.js` পাল্টে অন্য LLM provider — OpenAI ইত্যাদি — ব্যবহার করতে পারো)
- `VOYAGE_API_KEY` — RAG (PDF upload) কাজ করানোর জন্য দরকার। https://dash.voyageai.com থেকে
  বিনামূল্যে key নাও। এটা না দিলেও বাকি সব (chat, memory) ঠিকমতো কাজ করবে, শুধু PDF থেকে
  answer আসবে না — chat automatically RAG skip করে normal chat করবে।
- `TAVILY_API_KEY` — optional, শুধু `web_search` tool চালু করার জন্য। https://tavily.com থেকে
  ফ্রি key নাও। খালি রাখলে calculator আর weather tool ঠিকই কাজ করবে, শুধু web search বাদ যাবে।

চালু করো:

```bash
npm run dev
```

Server চলবে `http://localhost:5000`

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend চলবে `http://localhost:5173` (Vite proxy `/api` কল automatically backend-এ পাঠাবে)

## 3. Try it out

1. `/register` থেকে account বানাও
2. "Create New AI" চাপো → নাম, personality, language, custom instructions দাও
3. Chat খোলো, "remember that I prefer short answers" লিখে পাঠাও
4. Memory page-এ গিয়ে দেখো সেটা save হয়েছে
5. আবার chat করলে দেখবে AI সেই memory ব্যবহার করে উত্তর দিচ্ছে

## Data model

- `User` — name, email, hashed password
- `Assistant` — userId, name, personality, language, responseStyle, customInstructions
- `Memory` — userId, assistantId, content, type (preference/personal_info/instruction/interest/project/temporary)
- `Conversation` — userId, assistantId, title
- `Message` — conversationId, role (user/assistant), content
- `KnowledgeFile` — userId, assistantId, fileName, fileUrl, status (processing/ready/failed), chunkCount
- `Chunk` — userId, assistantId, fileId, content, embedding (float array, from Voyage AI)

## How chat context is built (backend/src/controllers/chatController.js)

```
User message
   ↓
Load assistant config (personality, language, instructions)
   ↓
Load saved memories for this assistant
   ↓
Load recent conversation history
   ↓
Embed the question (Voyage AI) → cosine-similarity search over this assistant's chunks
   ↓
Build system prompt (config + memory + top-matching document excerpts)
   ↓
Call LLM with system prompt + history + new message
   ↓
Save both messages, auto-detect & save new memory if triggered
   ↓
Return reply
```

## How RAG works (backend/src/controllers/knowledgeController.js)

```
PDF upload
   ↓
pdf-parse extracts raw text
   ↓
textProcessor.js splits it into ~800-char overlapping chunks
   ↓
Voyage AI embeds each chunk (batches of 32)
   ↓
Chunks + embeddings saved to MongoDB (per user + per assistant)
```

At chat time, the question is embedded the same way and compared against every stored
chunk for that assistant with cosine similarity — the top 4 matches get pulled into the
system prompt. This in-app similarity search is fine at MVP scale (hundreds–low thousands
of chunks per assistant); if you outgrow that, swap `retrieveRelevantChunks` in
`chatController.js` for a MongoDB Atlas Vector Search `$vectorSearch` aggregation, which
scales much further without changing anything else in the pipeline.

## How the tool/agent loop works (backend/src/utils/llm.js, tools.js)

```
User message + tool schemas sent to Claude
   ↓
stop_reason === "tool_use"?
   ├─ No  → return the text answer
   └─ Yes → run the requested tool(s) (calculator / get_weather / web_search)
             ↓
            feed tool_result(s) back to Claude
             ↓
            loop again (up to 5 steps)
```

Adding a new tool takes two steps: write its executor in `backend/src/utils/` (see
`calculator.js` / `weather.js` for the pattern), then register its name, description
and JSON schema in `tools.js`'s `getAvailableTools()` and its dispatch in `executeTool()`.

## How Voice works (frontend/src/utils/voice.js)

Pure browser-side, using the Web Speech API — no server round-trip, no API key:

- **Speech-to-text**: `SpeechRecognition` (Chrome/Edge) listens once, streams interim
  results into the input box live, and resolves with the final transcript, which is
  sent as a normal chat message.
- **Text-to-speech**: `speechSynthesis` reads a reply aloud, either on demand (🔊 button
  on each assistant bubble) or automatically when "Auto-speak replies" is checked.
- Both use a language code derived from the assistant's `language` field
  (`English → en-US`, `Bangla → bn-BD`, etc. — see `LANG_CODES` in `voice.js`, add more
  as needed).
- Browser support varies: Chrome/Edge support both directions well; Safari and Firefox
  support text-to-speech but have weaker (or no) `SpeechRecognition` support, so the mic
  button simply doesn't render if it isn't available — chat still works by typing.

## Next milestones

The original roadmap's V1–V4 are all covered now. Anything past that — fine-tuning,
subscriptions/billing, analytics, and team sharing — is optional polish for a real
production launch rather than core functionality, and can be added incrementally
whenever it's actually needed.

Fine-tuning এখনই দরকার নেই — custom instructions + memory + (পরে) RAG + tools দিয়েই
এই ধরনের personalization যথেষ্ট শক্তিশালী হয়।
