import express from "express";
import { saveMyReview, getMyReview, getAllReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMyReview);
router.post("/", saveMyReview);
router.get("/", adminOnly, getAllReviews); // only the admin can list everyone's reviews

export default router;