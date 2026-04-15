import User from "../models/User.js";
import CompanyOtp from "../models/CompanyOtp.js";
import crypto from "crypto";
import { sendOtpEmail, sendOtpWhatsApp, sendVerificationSuccess } from "../utils/notifications.js";

// GST Number validation regex (Indian GST format: 22AAAAA0000A1Z5)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Generate 6-digit OTP
function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

// Mock GST details lookup (in production, integrate with real GST API)
function mockGstLookup(gstNumber) {
    // Simulated GST data based on the number
    const stateCode = gstNumber.substring(0, 2);
    const states = {
        "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
        "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
        "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
        "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
        "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
        "16": "Tripura", "17": "Meghalaya", "18": "Assam",
        "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
        "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
        "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
        "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
        "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
        "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
        "37": "Andhra Pradesh (New)"
    };

    return {
        gstNumber,
        legalName: `${gstNumber.substring(2, 7)} Enterprises Pvt Ltd`,
        tradeName: `${gstNumber.substring(2, 7)} Seeds & Agriculture`,
        state: states[stateCode] || "Unknown State",
        status: "Active",
        businessType: "Private Limited Company",
        registrationDate: "2020-04-01"
    };
}

/**
 * Initiate company verification - validates GST and sends OTP
 */
export async function initiateVerification(req, res) {
    const { gstNumber, companyName } = req.validated.body;
    const userId = req.user._id;

    // Validate GST format
    if (!GST_REGEX.test(gstNumber)) {
        return res.status(400).json({
            message: "Invalid GST number format. Expected format: 22AAAAA0000A1Z5"
        });
    }

    // Check if user is already a verified company
    if (req.user.accountType === "company" &&
        req.user.companyDetails?.verificationStatus === "verified") {
        return res.status(400).json({
            message: "You are already a verified company"
        });
    }

    // Check if GST is already registered to another user
    const existingUser = await User.findOne({
        "companyDetails.gstNumber": gstNumber,
        "companyDetails.verificationStatus": "verified",
        _id: { $ne: userId }
    });

    if (existingUser) {
        return res.status(409).json({
            message: "This GST number is already registered to another account"
        });
    }

    // Delete any existing OTP for this user
    await CompanyOtp.deleteMany({ userId });

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP record
    await CompanyOtp.create({
        userId,
        gstNumber,
        companyName,
        otp,
        expiresAt
    });

    // Get mock GST details
    const gstDetails = mockGstLookup(gstNumber);

    // Log OTP to console (always, as backup)
    console.log("\n========================================");
    console.log("🔐 COMPANY VERIFICATION OTP");
    console.log("========================================");
    console.log(`GST Number: ${gstNumber}`);
    console.log(`Company: ${companyName}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log("========================================\n");

    // Send OTP via Email
    const emailResult = await sendOtpEmail({
        to: req.user.email,
        otp,
        companyName
    });

    // Send OTP via WhatsApp (if phone available)
    let whatsappResult = { success: false, skipped: true };
    if (req.user.phone) {
        whatsappResult = await sendOtpWhatsApp({
            to: req.user.phone,
            otp,
            companyName
        });
    }

    // Build message based on what was sent
    let deliveryMessage = "OTP sent to your email";
    if (whatsappResult.success) {
        deliveryMessage = "OTP sent to your email and WhatsApp";
    } else if (!req.user.phone) {
        deliveryMessage = "OTP sent to your email (add phone number to receive WhatsApp notifications)";
    }

    res.json({
        message: deliveryMessage,
        gstDetails,
        expiresAt,
        delivery: {
            email: emailResult.success,
            whatsapp: whatsappResult.success
        }
    });
}

/**
 * Verify OTP and complete company verification
 */
export async function verifyOtp(req, res) {
    const { otp } = req.validated.body;
    const userId = req.user._id;

    // Find valid OTP record
    const otpRecord = await CompanyOtp.findOne({
        userId,
        expiresAt: { $gt: new Date() },
        verified: false
    });

    if (!otpRecord) {
        return res.status(400).json({
            message: "No pending verification found or OTP expired. Please start again."
        });
    }

    // Check max attempts (5 attempts allowed)
    if (otpRecord.attempts >= 5) {
        await CompanyOtp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
            message: "Too many failed attempts. Please start verification again."
        });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return res.status(400).json({
            message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
        });
    }

    // OTP verified! Update user to verified company
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            accountType: "company",
            companyDetails: {
                gstNumber: otpRecord.gstNumber,
                companyName: otpRecord.companyName,
                verificationStatus: "verified",
                verifiedAt: new Date()
            }
        },
        { new: true }
    );

    // Mark OTP as verified and clean up
    otpRecord.verified = true;
    await otpRecord.save();

    // Add verified company badge
    if (!updatedUser.badges.find(b => b.key === "verified_company")) {
        updatedUser.badges.push({
            key: "verified_company",
            label: "Verified Company",
            earnedAt: new Date()
        });
        await updatedUser.save();
    }

    console.log("\n========================================");
    console.log("✅ COMPANY VERIFIED SUCCESSFULLY!");
    console.log("========================================");
    console.log(`Company: ${otpRecord.companyName}`);
    console.log(`GST: ${otpRecord.gstNumber}`);
    console.log(`User: ${updatedUser.email}`);
    console.log("========================================\n");

    // Send verification success notifications
    sendVerificationSuccess({
        email: updatedUser.email,
        phone: updatedUser.phone,
        companyName: otpRecord.companyName
    }).catch(err => console.error("Failed to send success notifications:", err));

    res.json({
        message: "Company verified successfully! You now have a verified badge.",
        verified: true,
        companyDetails: updatedUser.companyDetails
    });
}

/**
 * Get verification status
 */
export async function getVerificationStatus(req, res) {
    const user = req.user;

    res.json({
        accountType: user.accountType,
        isVerifiedCompany: user.accountType === "company" &&
            user.companyDetails?.verificationStatus === "verified",
        companyDetails: user.companyDetails || null
    });
}

/**
 * Resend OTP
 */
export async function resendOtp(req, res) {
    const userId = req.user._id;

    // Find existing OTP record
    const existingOtp = await CompanyOtp.findOne({
        userId,
        verified: false
    });

    if (!existingOtp) {
        return res.status(400).json({
            message: "No pending verification found. Please start verification again."
        });
    }

    // Generate new OTP
    const newOtp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    existingOtp.otp = newOtp;
    existingOtp.expiresAt = expiresAt;
    existingOtp.attempts = 0;
    await existingOtp.save();

    // Log new OTP to console
    console.log("\n========================================");
    console.log("🔐 NEW COMPANY VERIFICATION OTP (RESEND)");
    console.log("========================================");
    console.log(`GST Number: ${existingOtp.gstNumber}`);
    console.log(`Company: ${existingOtp.companyName}`);
    console.log(`NEW OTP: ${newOtp}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log("========================================\n");

    // Send OTP via Email
    const emailResult = await sendOtpEmail({
        to: req.user.email,
        otp: newOtp,
        companyName: existingOtp.companyName
    });

    // Send OTP via WhatsApp (if phone available)
    let whatsappResult = { success: false, skipped: true };
    if (req.user.phone) {
        whatsappResult = await sendOtpWhatsApp({
            to: req.user.phone,
            otp: newOtp,
            companyName: existingOtp.companyName
        });
    }

    res.json({
        message: "New OTP sent successfully",
        expiresAt,
        delivery: {
            email: emailResult.success,
            whatsapp: whatsappResult.success
        }
    });
}

