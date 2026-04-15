import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { exchangeCreateSchema } from "./_schemas.js";
import { approve, cancel, createExchange, inbox, outbox, reject, approveExchange,
  rejectExchange, cancelExchange } from "../controllers/exchanges.controller.js";

const r = Router();

r.post("/", requireAuth, validate(exchangeCreateSchema), createExchange);
r.get("/inbox", requireAuth, inbox);
r.get("/outbox", requireAuth, outbox);
r.patch("/:id/approve", requireAuth, approve);
r.patch("/:id/reject", requireAuth, reject);
r.patch("/:id/cancel", requireAuth, cancel);
r.post("/:id/approve", requireAuth, approveExchange);
r.post("/:id/reject", requireAuth, rejectExchange);
r.post("/:id/cancel", requireAuth, cancelExchange);

export default r;
