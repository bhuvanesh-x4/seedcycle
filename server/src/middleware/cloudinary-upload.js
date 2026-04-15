// ============================================================
// Feature 3: Cloudinary Image Upload (SaaS)
// Replaces: server/src/middleware/upload.js
// Install: npm install cloudinary multer-storage-cloudinary
// ============================================================

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary with env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for seed listings
const seedStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "seedcycle/seeds",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "limit" },  // Resize large images
      { quality: "auto:good" },                      // Auto-optimize quality
      { format: "webp" },                            // Convert to WebP
    ],
  },
});

// Cloudinary storage for feed posts
const feedStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "seedcycle/feed",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 900, crop: "limit" },
      { quality: "auto:good" },
    ],
  },
});

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "seedcycle/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 256, height: 256, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
    ],
  },
});

// ── Fallback: Use local storage if Cloudinary not configured ──
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadSeed, uploadFeed, uploadAvatar;

if (useCloudinary) {
  console.log("☁️  Image storage: Cloudinary CDN");
  uploadSeed = multer({ storage: seedStorage });
  uploadFeed = multer({ storage: feedStorage });
  uploadAvatar = multer({ storage: avatarStorage });
} else {
  console.log("📁 Image storage: Local (Multer)");
  // Fallback to local storage (original behavior)
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + "-" + file.originalname);
    },
  });
  const localUpload = multer({ storage: localStorage });
  uploadSeed = localUpload;
  uploadFeed = localUpload;
  uploadAvatar = localUpload;
}

export { uploadSeed, uploadFeed, uploadAvatar, cloudinary };

// ============================================================
// HOW TO USE IN CONTROLLERS:
//
// When using Cloudinary, the file URL comes from:
//   req.file.path      → Cloudinary URL (https://res.cloudinary.com/...)
//
// When using local storage:
//   req.file.filename   → local filename
//   photoUrl = `/uploads/${req.file.filename}`
//
// So in your controller, do:
//   const photoUrl = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
// ============================================================
