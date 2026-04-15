import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signJwt } from "../utils/jwt.js";
import { authCookieOptions } from "../config/cookies.js";

function publicUser(u) {
  // Compute isVerifiedCompany flag for blue tick display
  const isVerifiedCompany = u.accountType === "company" &&
    u.companyDetails?.verificationStatus === "verified";

  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,

    avatarUrl: u.avatarUrl,
    bio: u.bio,
    points: u.points,
    badges: u.badges,
    exchangesCompleted: u.exchangesCompleted,
    homeLocation: u.homeLocation,

    // Company verification fields
    accountType: u.accountType || "individual",
    isVerifiedCompany,
    companyDetails: u.companyDetails || null
  };
}

export async function register(req, res) {
  const { name, email, password, phone } = req.validated.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, phone: phone || "" });

  const token = signJwt({ uid: user._id });
  res.cookie("seedcycle_token", token, authCookieOptions());
  res.json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signJwt({ uid: user._id });
  res.cookie("seedcycle_token", token, authCookieOptions());
  res.json({ user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function logout(req, res) {
  res.clearCookie("seedcycle_token", authCookieOptions());
  res.json({ ok: true });
}
