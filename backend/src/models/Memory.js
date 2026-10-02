import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant", required: true, index: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["preference", "personal_info", "instruction", "interest", "project", "temporary"],
      default: "preference",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Memory", memorySchema);
