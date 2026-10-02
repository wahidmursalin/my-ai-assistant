import mongoose from "mongoose";

const assistantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    personality: { type: String, default: "friendly" },
    language: { type: String, default: "English" },
    responseStyle: { type: String, default: "simple" },
    customInstructions: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Assistant", assistantSchema);
