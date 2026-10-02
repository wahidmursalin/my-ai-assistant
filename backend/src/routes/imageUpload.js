import multer from "multer";

// Memory storage — the buffer goes straight to Cloudinary, never touching
// local disk (which platforms like Render wipe on redeploy).
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP, or GIF images are supported"));
    }
    cb(null, true);
  },
});