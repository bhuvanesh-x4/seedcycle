import FeedPost from "../models/FeedPost.js";
import User from "../models/User.js";
import { POINTS, computeBadges } from "../utils/points.js";

export async function createPost(req, res) {
  const { content } = req.validated.body;
  const photoUrl = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null;

  const post = await FeedPost.create({
    author: req.user._id,
    content,
    photoUrl
  });

  // gamification
  const user = await User.findById(req.user._id);
  user.points += POINTS.FEED_POST;
  user.badges = computeBadges(user);
  await user.save();

  res.status(201).json({ post });
}

export async function listPosts(req, res) {
  const posts = await FeedPost.find()
    .populate("author", "name avatarUrl points badges")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ posts });
}

export async function updatePost(req, res) {
  const post = await FeedPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  const { content } = req.validated.body;
  post.content = content;
  await post.save();

  res.json({ post });
}

export async function deletePost(req, res) {
  const post = await FeedPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await post.deleteOne();
  res.json({ ok: true });
}
