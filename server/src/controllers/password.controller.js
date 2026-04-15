import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, sendWhatsApp } from "../utils/notifications.js";

// Generate 6-digit OTP
function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Request password reset - sends OTP to email and WhatsApp
 */
export async function requestPasswordReset(req, res) {
    const { email } = req.validated.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if email exists or not (security)
        return res.json({
            message: "If an account with this email exists, we've sent a password reset OTP."
        });
    }

    // Delete any existing reset requests
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset record
    await PasswordReset.create({
        userId: user._id,
        email: email.toLowerCase(),
        otp,
        expiresAt
    });

    // Log OTP to console (backup)
    console.log("\n========================================");
    console.log("🔑 PASSWORD RESET OTP");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log("========================================\n");

    // Send OTP via Email
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ffc8; margin: 0;">🌱 SeedCycle</h1>
        <p style="color: #8b949e; margin-top: 8px;">Password Reset</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #fff; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #8b949e;">Hi <strong style="color: #00ffc8;">${user.name}</strong>, use this code to reset your password:</p>
        
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px 40px; border-radius: 12px; display: inline-block; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
        </div>
        
        <p style="color: #f97316; font-size: 14px; margin-top: 20px;">
          ⏰ This OTP expires in 10 minutes
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6e7681; font-size: 12px;">
        <p>If you didn't request this, please ignore this email or contact support.</p>
        <p>© ${new Date().getFullYear()} SeedCycle - Sustainable Seed Exchange Platform</p>
      </div>
    </div>
    `;

    const emailResult = await sendEmail({
        to: email,
        subject: "🔑 SeedCycle - Password Reset OTP",
        html: emailHtml
    });

    // Send OTP via WhatsApp (if phone available)
    let whatsappResult = { success: false, skipped: true };
    if (user.phone) {
        const message = `🔑 *SeedCycle Password Reset*

Hi ${user.name},

Your password reset OTP is:

*${otp}*

This code expires in 10 minutes.

If you didn't request this, please ignore this message and secure your account.

🌱 SeedCycle Team`;

        whatsappResult = await sendWhatsApp({ to: user.phone, message });
    }

    res.json({
        message: "If an account with this email exists, we've sent a password reset OTP.",
        delivery: {
            email: emailResult.success,
            whatsapp: whatsappResult.success
        }
    });
}

/**
 * Verify OTP for password reset
 */
export async function verifyResetOtp(req, res) {
    const { email, otp } = req.validated.body;

    // Find valid reset record
    const resetRecord = await PasswordReset.findOne({
        email: email.toLowerCase(),
        expiresAt: { $gt: new Date() },
        verified: false
    });

    if (!resetRecord) {
        return res.status(400).json({
            message: "Invalid or expired OTP. Please request a new password reset."
        });
    }

    // Check max attempts
    if (resetRecord.attempts >= 5) {
        await PasswordReset.deleteOne({ _id: resetRecord._id });
        return res.status(400).json({
            message: "Too many failed attempts. Please request a new password reset."
        });
    }

    // Verify OTP
    if (resetRecord.otp !== otp) {
        resetRecord.attempts += 1;
        await resetRecord.save();
        return res.status(400).json({
            message: `Invalid OTP. ${5 - resetRecord.attempts} attempts remaining.`
        });
    }

    // Mark as verified (but don't delete yet - will be used in reset)
    resetRecord.verified = true;
    await resetRecord.save();

    res.json({
        message: "OTP verified! You can now reset your password.",
        verified: true
    });
}

/**
 * Reset password with verified OTP
 */
export async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.validated.body;

    // Find verified reset record
    const resetRecord = await PasswordReset.findOne({
        email: email.toLowerCase(),
        otp,
        verified: true,
        expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
        return res.status(400).json({
            message: "Invalid reset request. Please start the password reset process again."
        });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(resetRecord.userId, { passwordHash });

    // Delete the reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    // Send confirmation email
    const user = await User.findById(resetRecord.userId);
    const confirmHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ffc8; margin: 0;">🌱 SeedCycle</h1>
      </div>
      
      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="color: #22c55e; margin: 0;">Password Changed Successfully!</h2>
        <p style="color: #fff; margin-top: 12px;">
          Hi ${user.name}, your password has been successfully updated.
        </p>
        <p style="color: #8b949e; font-size: 14px;">
          If you didn't make this change, please contact support immediately.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6e7681; font-size: 12px;">
        <p>© ${new Date().getFullYear()} SeedCycle</p>
      </div>
    </div>
    `;

    sendEmail({
        to: email,
        subject: "✅ SeedCycle - Password Changed Successfully",
        html: confirmHtml
    }).catch(err => console.error("Failed to send confirmation email:", err));

    console.log("\n========================================");
    console.log("✅ PASSWORD RESET SUCCESSFUL");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log(`User: ${user.name}`);
    console.log("========================================\n");

    res.json({
        message: "Password reset successful! You can now login with your new password."
    });
}
