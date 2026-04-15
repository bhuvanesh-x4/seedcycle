import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete when expired
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

// Index for faster lookups
passwordResetSchema.index({ email: 1, expiresAt: 1 });

export default mongoose.model("PasswordReset", passwordResetSchema);
