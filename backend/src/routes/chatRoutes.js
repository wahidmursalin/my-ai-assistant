import express from "express";
import { sendMessage, getConversations, getMessages, sendImageMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { uploadImage } from "./imageUpload.js";

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.post("/image", uploadImage.single("image"), sendImageMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);

export default router;