import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serves uploaded chat images (and anything else in src/uploads) so the
// frontend can display them, e.g. http://localhost:5000/uploads/<file>
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/assistants", assistantRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/knowledge", knowledgeRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});