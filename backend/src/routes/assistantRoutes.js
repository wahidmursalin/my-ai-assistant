import express from "express";
import {
  createAssistant,
  getAssistants,
  getAssistantById,
  teachAssistant,
  deleteAssistant,
} from "../controllers/assistantController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createAssistant);
router.get("/", getAssistants);
router.get("/:id", getAssistantById);
router.post("/:id/teach", teachAssistant);
router.delete("/:id", deleteAssistant);

export default router;
