import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { uploadKnowledge, getKnowledgeFiles, deleteKnowledgeFile } from "../controllers/knowledgeController.js";

// Memory storage, not disk — the buffer goes straight to Cloudinary so nothing
// is ever written to local disk (which platforms like Render wipe on redeploy).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are supported right now"));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("file"), uploadKnowledge);
router.get("/", getKnowledgeFiles);
router.delete("/:id", deleteKnowledgeFile);

export default router;