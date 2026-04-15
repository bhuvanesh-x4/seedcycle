import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProfile, refreshBadges, updateProfile, getAllUsers } from "../controllers/user.controller.js";

const r = Router();

r.get("/profile", requireAuth, getProfile);
r.patch("/profile", requireAuth, updateProfile);
r.post("/badges/refresh", requireAuth, refreshBadges);
r.get("/all", requireAuth, getAllUsers);

export default r;

