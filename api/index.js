// ============================================================
// Vercel Serverless Entry Point
// Place at: SeedCycle_MERN_MVP/api/index.js
// This wraps your Express app for Vercel's serverless runtime
// ============================================================

import app from "../server/src/app.js";
import { connectDb } from "../server/src/config/db.js";

// Connect to MongoDB once (reused across warm invocations)
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await connectDb();
    isConnected = true;
  }
}

export default async function handler(req, res) {
  await ensureConnection();
  return app(req, res);
}
