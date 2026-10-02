import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import { uploadKnowledge, getKnowledgeFiles, deleteKnowledgeFile } from "../controllers/knowledgeController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
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
