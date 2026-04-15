import mongoose from "mongoose";

const companyOtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    gstNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete expired docs
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for quick lookups
companyOtpSchema.index({ userId: 1, gstNumber: 1 });

export default mongoose.model("CompanyOtp", companyOtpSchema);
