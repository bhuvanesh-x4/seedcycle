import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { seedCreateSchema, seedNearSchema } from "./_schemas.js";
import {
  createListing, deleteListing, getListing, listListings, nearListings, myListings, updateListing
} from "../controllers/seeds.controller.js";

const r = Router();
r.get("/mine", requireAuth, myListings);

r.get("/", listListings);
r.get("/near", validate(seedNearSchema), nearListings);
r.get("/:id", getListing);

r.post("/", requireAuth, upload.single("photo"), validate(seedCreateSchema), createListing);
r.patch("/:id", requireAuth, upload.single("photo"), updateListing);
r.delete("/:id", requireAuth, deleteListing);

export default r;
