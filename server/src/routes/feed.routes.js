import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/cloudinary-upload.js";
import { feedCreateSchema, feedUpdateSchema } from "./_schemas.js";
import { createPost, deletePost, listPosts, updatePost } from "../controllers/feed.controller.js";

const r = Router();

r.get("/", listPosts);
r.post("/", requireAuth, upload.single("photo"), validate(feedCreateSchema), createPost);
r.patch("/:id", requireAuth, validate(feedUpdateSchema), updatePost);
r.delete("/:id", requireAuth, deletePost);

export default r;
