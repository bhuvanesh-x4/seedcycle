import { verifyJwt } from "../utils/jwt.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.seedcycle_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.uid).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid session" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
