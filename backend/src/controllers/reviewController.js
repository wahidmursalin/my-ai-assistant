import Review from "../models/Review.js";

// Create or update the logged-in user's own review.
export const saveMyReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = (req.body.comment || "").toString().trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ message: "Comment is too long (max 1000 characters)" });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.userId },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ rating: review.rating, comment: review.comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// The logged-in user's own review (to pre-fill the form). Returns null if none.
export const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.userId });
    res.json(review ? { rating: review.rating, comment: review.comment } : null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin only: all reviews + summary.
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    const total = reviews.length;
    const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

    res.json({
      total,
      average: Number(average.toFixed(2)),
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        updatedAt: r.updatedAt,
        user: r.user ? { name: r.user.name, email: r.user.email } : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};