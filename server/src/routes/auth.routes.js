import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authLoginSchema, authRegisterSchema } from "./_schemas.js";
import { login, logout, me, register } from "../controllers/auth.controller.js";

const r = Router();

r.post("/register", validate(authRegisterSchema), register);
r.post("/login", validate(authLoginSchema), login);
r.get("/me", requireAuth, me);
r.post("/logout", requireAuth, logout);

export default r;
