import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "SeedListing", required: true },

  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  kind: { type: String, enum: ["EXCHANGE", "BUY"], default: "EXCHANGE" },

  // For BUY
  offeredPrice: { type: Number, default: null },

  // For EXCHANGE (requester offers one of their listings)
  offeredListing: { type: mongoose.Schema.Types.ObjectId, ref: "SeedListing", default: null },

  message: { type: String, default: "" },

  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.model("ExchangeRequest", exchangeRequestSchema);
