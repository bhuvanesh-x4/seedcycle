import mongoose from "mongoose";

const seedListingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true }, // seed/plant/cutting
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
currency: { type: String, default: "INR" },

  description: { type: String, default: "" },
  photoUrl: String,

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },

  status: { type: String, enum: ["AVAILABLE", "ON_HOLD", "EXCHANGED"], default: "AVAILABLE" }
}, { timestamps: true });

seedListingSchema.index({ location: "2dsphere" });

export default mongoose.model("SeedListing", seedListingSchema);
