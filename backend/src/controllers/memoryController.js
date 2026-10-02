import Memory from "../models/Memory.js";
import Assistant from "../models/Assistant.js";

export const createMemory = async (req, res) => {
  try {
    const { assistantId, content, type } = req.body;

    if (!assistantId || !content) {
      return res.status(400).json({ message: "assistantId and content are required" });
    }

    const assistant = await Assistant.findOne({ _id: assistantId, userId: req.userId });
    if (!assistant) return res.status(404).json({ message: "Assistant not found" });

    const memory = await Memory.create({
      userId: req.userId,
      assistantId,
      content,
      type: type || "preference",
    });

    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemories = async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.assistantId) filter.assistantId = req.query.assistantId;

    const memories = await Memory.find(filter).sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
