import express from "express";
import { createMemory, getMemories, deleteMemory } from "../controllers/memoryController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createMemory);
router.get("/", getMemories);
router.delete("/:id", deleteMemory);

export default router;
