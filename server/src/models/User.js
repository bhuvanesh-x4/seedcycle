import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

// Company details schema for verified businesses
const companyDetailsSchema = new mongoose.Schema({
  gstNumber: { type: String, trim: true, uppercase: true },
  companyName: { type: String, trim: true },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },
  verifiedAt: Date,
  rejectionReason: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },

  passwordHash: { type: String, required: true },

  avatarUrl: String,
  bio: String,

  // Account type: individual users or verified companies
  accountType: {
    type: String,
    enum: ["individual", "company"],
    default: "individual"
  },

  // Company verification details (only for company accounts)
  companyDetails: { type: companyDetailsSchema, default: null },

  points: { type: Number, default: 0 },
  badges: { type: [badgeSchema], default: [] },

  exchangesCompleted: { type: Number, default: 0 },

  homeLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  }
}, { timestamps: true });

// Virtual field to check if user is a verified company (for blue tick)
userSchema.virtual("isVerifiedCompany").get(function () {
  return this.accountType === "company" &&
    this.companyDetails?.verificationStatus === "verified";
});

userSchema.index({ homeLocation: "2dsphere" });

export default mongoose.model("User", userSchema);
