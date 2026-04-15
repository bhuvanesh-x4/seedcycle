import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { passwordResetRequestSchema, passwordVerifyOtpSchema, passwordResetSchema } from "./_schemas.js";
import { requestPasswordReset, verifyResetOtp, resetPassword } from "../controllers/password.controller.js";

const router = Router();

// Request password reset OTP
router.post("/request-reset", validate(passwordResetRequestSchema), requestPasswordReset);

// Verify OTP for password reset
router.post("/verify-otp", validate(passwordVerifyOtpSchema), verifyResetOtp);

// Reset password with verified OTP
router.post("/reset", validate(passwordResetSchema), resetPassword);

export default router;
