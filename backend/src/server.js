// dotenv must be the very first import — ES module imports execute in order,
// so this guarantees .env is loaded before any other module (including ones
// that read process.env at import time) gets evaluated.
import "dotenv/config";

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Note: uploaded PDFs and chat images are stored on Cloudinary (not local disk),
// so no static file serving is needed here — every file URL is already a full
// https:// Cloudinary link, which also works cleanly when the frontend and
// backend are deployed to different domains.

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/assistants", assistantRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});