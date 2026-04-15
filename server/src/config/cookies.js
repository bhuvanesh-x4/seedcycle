import { env } from "./env.js";

export function authCookieOptions() {
  const isProd = env.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,     // true in production (HTTPS)
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}
