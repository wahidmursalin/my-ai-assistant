import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant", required: true, index: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeFile", required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Chunk", chunkSchema);
