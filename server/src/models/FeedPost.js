import mongoose from "mongoose";

const feedPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 800 },
  photoUrl: String,
  likes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("FeedPost", feedPostSchema);
