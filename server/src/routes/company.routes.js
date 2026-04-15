import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { companyInitiateSchema, companyVerifyOtpSchema } from "./_schemas.js";
import {
    initiateVerification,
    verifyOtp,
    getVerificationStatus,
    resendOtp
} from "../controllers/company.controller.js";

const r = Router();

// All routes require authentication
r.use(requireAuth);

// Get current verification status
r.get("/status", getVerificationStatus);

// Initiate company verification (submit GST number)
r.post("/initiate-verification", validate(companyInitiateSchema), initiateVerification);

// Verify OTP to complete verification
r.post("/verify-otp", validate(companyVerifyOtpSchema), verifyOtp);

// Resend OTP
r.post("/resend-otp", resendOtp);

export default r;
