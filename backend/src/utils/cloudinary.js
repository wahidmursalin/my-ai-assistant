// Persistent file storage via Cloudinary (free tier: 25GB storage + bandwidth).
// Used instead of the local disk because platforms like Render's free tier wipe
// local files on every redeploy/restart — Cloudinary URLs survive that.

import { v2 as cloudinary } from "cloudinary";

// IMPORTANT: configuration happens lazily, inside each function call, not at
// module load time. ES module imports run before the importing file's own
// top-level code (like dotenv.config()), so configuring at import time would
// read process.env before .env has actually been loaded — causing a
// permanent "Must supply api_key" error no matter what's in .env.
const configure = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadBuffer = (buffer, { folder, resourceType = "auto" } = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return Promise.reject(new Error("Cloudinary is not configured. Add CLOUDINARY_* keys to backend/.env"));
  }

  configure();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  if (!publicId) return Promise.resolve();
  configure();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {});
};