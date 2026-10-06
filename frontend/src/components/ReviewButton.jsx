import { useState } from "react";
import api from "../services/api.js";
import { StarIcon } from "./Stars.jsx";

export default function ReviewButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const openModal = async () => {
    setOpen(true);
    setSaved(false);
    setError("");
    try {
      const { data } = await api.get("/reviews/me");
      if (data) {
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch {
      /* ignore – form just starts empty */
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please select a star rating");
    setLoading(true);
    setError("");
    try {
      await api.post("/reviews", { rating, comment });
      setSaved(true);
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={openModal} className="btn-soft w-full">
        <StarIcon filled className="w-4 h-4 text-amber-400" /> Rate &amp; Review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card w-full max-w-sm p-5 space-y-4">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink">Rate your experience</h2>
              <p className="text-sm text-ink/60">Your feedback helps us improve.</p>
            </div>

            <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="text-amber-400 transition-transform hover:scale-110"
                >
                  <StarIcon filled={n <= (hover || rating)} className="w-9 h-9" />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Write a comment (optional)..."
              className="field w-full resize-none"
            />

            {error && <p className="text-sm text-rose-500">{error}</p>}
            {saved && <p className="text-sm text-green-600">Thanks! Your review was saved ✓</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-soft flex-1">Cancel</button>
              <button disabled={loading} className="btn-primary flex-1">{loading ? "Saving..." : "Submit"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}