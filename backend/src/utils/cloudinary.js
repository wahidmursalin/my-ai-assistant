// Persistent file storage via Cloudinary (free tier: 25GB storage + bandwidth).
// Used instead of the local disk because platforms like Render's free tier wipe
// local files on every redeploy/restart — Cloudinary URLs survive that.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBuffer = (buffer, { folder, resourceType = "auto" } = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return Promise.reject(new Error("Cloudinary is not configured. Add CLOUDINARY_* keys to backend/.env"));
  }

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
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {});
};