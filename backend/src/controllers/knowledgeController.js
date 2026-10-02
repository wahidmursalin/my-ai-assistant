import fs from "fs";
import pdfParse from "pdf-parse";
import Assistant from "../models/Assistant.js";
import KnowledgeFile from "../models/KnowledgeFile.js";
import Chunk from "../models/Chunk.js";
import { chunkText } from "../utils/textProcessor.js";
import { embedDocuments } from "../utils/embeddings.js";

export const uploadKnowledge = async (req, res) => {
  try {
    const { assistantId } = req.body;
    if (!assistantId) return res.status(400).json({ message: "assistantId is required" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const assistant = await Assistant.findOne({ _id: assistantId, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    const knowledgeFile = await KnowledgeFile.create({
      userId: req.userId,
      assistantId,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      status: "processing",
    });

    // Respond right away, process in the background so the upload doesn't time out.
    res.status(202).json(knowledgeFile);

    try {
      const buffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(buffer);
      const pieces = chunkText(parsed.text);

      if (pieces.length === 0) {
        await KnowledgeFile.findByIdAndUpdate(knowledgeFile._id, {
          status: "failed",
          error: "No extractable text found in this PDF",
        });
        return;
      }

      // Embed in batches of 32 to stay well within API request limits
      const BATCH = 32;
      const allChunkDocs = [];
      for (let i = 0; i < pieces.length; i += BATCH) {
        const batch = pieces.slice(i, i + BATCH);
        const vectors = await embedDocuments(batch);
        batch.forEach((content, j) => {
          allChunkDocs.push({
            userId: req.userId,
            assistantId,
            fileId: knowledgeFile._id,
            content,
            embedding: vectors[j],
          });
        });
      }

      await Chunk.insertMany(allChunkDocs);
      await KnowledgeFile.findByIdAndUpdate(knowledgeFile._id, {
        status: "ready",
        chunkCount: allChunkDocs.length,
      });
    } catch (processErr) {
      await KnowledgeFile.findByIdAndUpdate(knowledgeFile._id, {
        status: "failed",
        error: processErr.message,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getKnowledgeFiles = async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.assistantId) filter.assistantId = req.query.assistantId;
    const files = await KnowledgeFile.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteKnowledgeFile = async (req, res) => {
  try {
    const file = await KnowledgeFile.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!file) return res.status(404).json({ message: "File not found" });

    await Chunk.deleteMany({ fileId: file._id, userId: req.userId });
    fs.unlink(file.fileUrl, () => {});

    res.json({ message: "Knowledge file deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
