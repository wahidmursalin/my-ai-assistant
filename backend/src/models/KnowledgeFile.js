import mongoose from "mongoose";

const knowledgeFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant", required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
    chunkCount: { type: Number, default: 0 },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeFile", knowledgeFileSchema);
