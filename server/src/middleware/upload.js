// ============================================================
// Feature 3: Cloudinary Image Upload (SaaS)
// REPLACES: server/src/middleware/upload.js
// Keeps same export name "upload" for backward compatibility
// ============================================================

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload;

if (useCloudinary) {
  // ── Cloudinary Storage (Cloud / Vercel) ─────────────────
  const { v2: cloudinary } = await import("cloudinary");
  const { CloudinaryStorage } = await import("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "seedcycle",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto:good" },
      ],
    },
  });

  upload = multer({ storage });
  console.log("☁️  Image storage: Cloudinary CDN");

} else {
  // ── Local Storage (Development / Fallback) ──────────────
  const uploadDir = path.join(__dirname, "..", "..", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
    },
  });

  function fileFilter(req, file, cb) {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PNG/JPEG/WEBP images allowed"), ok);
  }

  upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log("📁 Image storage: Local (Multer)");
}

export { upload };
