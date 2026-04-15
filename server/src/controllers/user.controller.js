import User from "../models/User.js";
import { computeBadges } from "../utils/points.js";
import { toPoint } from "../utils/geo.js";

export async function getProfile(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res) {
  const { name, bio, phone, lng, lat } = req.body;
  const avatarUrl = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : undefined;

  const updates = {};
  if (typeof name === "string" && name.trim().length >= 2) updates.name = name.trim();
  if (typeof bio === "string") updates.bio = bio.slice(0, 280);
  if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl;
  if (typeof phone === "string") updates.phone = phone.slice(0, 20);

  if (lng != null && lat != null) {
    const p = toPoint(lng, lat);
    if (p) updates.homeLocation = p;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-passwordHash");
  res.json({ user });
}

export async function refreshBadges(req, res) {
  const user = await User.findById(req.user._id);
  user.badges = computeBadges(user);
  await user.save();
  const fresh = await User.findById(req.user._id).select("-passwordHash");
  res.json({ badges: fresh.badges, points: fresh.points });
}

/**
 * Get all registered users (for connect feature)
 */
export async function getAllUsers(req, res) {
  const { search } = req.query;
  const currentUserId = req.user?._id;

  // Build query
  let query = {};
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { "companyDetails.companyName": searchRegex }
    ];
  }

  // Exclude current user from results
  if (currentUserId) {
    query._id = { $ne: currentUserId };
  }

  const users = await User.find(query)
    .select("name email avatarUrl bio points badges accountType companyDetails createdAt")
    .sort({ createdAt: -1 })
    .limit(50);

  // Add isVerifiedCompany flag
  const usersWithVerification = users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    points: u.points || 0,
    badges: u.badges || [],
    accountType: u.accountType || "individual",
    isVerifiedCompany: u.accountType === "company" && u.companyDetails?.verificationStatus === "verified",
    companyName: u.companyDetails?.companyName || null,
    createdAt: u.createdAt
  }));

  res.json({ users: usersWithVerification, count: usersWithVerification.length });
}

