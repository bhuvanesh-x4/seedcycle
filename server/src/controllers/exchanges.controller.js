import ExchangeRequest from "../models/ExchangeRequest.js";
import SeedListing from "../models/SeedListing.js";
import User from "../models/User.js";
import { POINTS, computeBadges } from "../utils/points.js";

export async function createExchange(req, res) {
  const { listingId, message, kind, offeredPrice, offeredListingId } = req.validated.body;

  const listing = await SeedListing.findById(listingId).populate("owner", "_id");
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  if (listing.status !== "AVAILABLE") return res.status(400).json({ message: "Listing not available" });

  const ownerId = listing.owner?._id || listing.owner;
  if (String(ownerId) === String(req.user._id)) return res.status(400).json({ message: "Cannot request your own listing" });

  const exists = await ExchangeRequest.findOne({ listing: listingId, requester: req.user._id, status: "PENDING" });
  if (exists) return res.status(409).json({ message: "Already requested" });

  let offeredListing = null;
  let finalOfferedPrice = null;

  if (kind === "BUY") {
    finalOfferedPrice = typeof offeredPrice === "number" ? offeredPrice : listing.price;
  }

  if (kind === "EXCHANGE") {
    if (!offeredListingId) return res.status(400).json({ message: "Select one of your listings to exchange" });

    const mine = await SeedListing.findById(offeredListingId);
    if (!mine) return res.status(404).json({ message: "Offered listing not found" });
    if (String(mine.owner) !== String(req.user._id)) return res.status(403).json({ message: "You don't own the offered listing" });
    if (mine.status !== "AVAILABLE") return res.status(400).json({ message: "Your offered listing must be AVAILABLE" });

    offeredListing = mine._id;
  }

  const ex = await ExchangeRequest.create({
    listing: listingId,
    requester: req.user._id,
    owner: ownerId,
    kind,
    offeredPrice: finalOfferedPrice,
    offeredListing,
    message: message || ""
  });

  res.status(201).json({ exchange: ex });
}


export async function inbox(req, res) {
  const exchanges = await ExchangeRequest.find({ owner: req.user._id })
    .populate("listing")
    .populate("offeredListing")

    .populate("requester", "name avatarUrl points badges")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ exchanges });
}

export async function outbox(req, res) {
  const exchanges = await ExchangeRequest.find({ requester: req.user._id })
    .populate("listing")
    .populate("offeredListing")

    .populate("owner", "name avatarUrl points badges")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ exchanges });
}

export async function approve(req, res) {
  const ex = await ExchangeRequest.findById(req.params.id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });
  if (String(ex.owner) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  if (ex.status !== "PENDING") return res.status(400).json({ message: "Not pending" });

  ex.status = "APPROVED";
  await ex.save();

  // mark listing ON_HOLD (MVP)
  await SeedListing.findByIdAndUpdate(ex.listing, { status: "ON_HOLD" });

  // gamification: owner gets points for approving exchange
  const owner = await User.findById(ex.owner);
  owner.points += POINTS.EXCHANGE_APPROVE;
  owner.exchangesCompleted += 1;
  owner.badges = computeBadges(owner);
  await owner.save();

  const requester = await User.findById(ex.requester);
  requester.exchangesCompleted += 1;
  requester.badges = computeBadges(requester);
  await requester.save();

  res.json({ exchange: ex });
}

export async function reject(req, res) {
  const ex = await ExchangeRequest.findById(req.params.id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });
  if (String(ex.owner) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  if (ex.status !== "PENDING") return res.status(400).json({ message: "Not pending" });

  ex.status = "REJECTED";
  await ex.save();
  res.json({ exchange: ex });
}

export async function cancel(req, res) {
  const ex = await ExchangeRequest.findById(req.params.id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });
  if (String(ex.requester) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  if (ex.status !== "PENDING") return res.status(400).json({ message: "Only pending requests can be cancelled" });

  ex.status = "CANCELLED";
  await ex.save();
  res.json({ exchange: ex });
}
export async function approveExchange(req, res) {
  const { id } = req.params;

  const ex = await ExchangeRequest.findById(id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });

  // only owner/seller can approve
  if (String(ex.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (ex.status !== "PENDING") {
    return res.status(400).json({ message: "Exchange already processed" });
  }

  ex.status = "APPROVED";
  await ex.save();

  // Optional: mark listing as not available after approval
  await SeedListing.findByIdAndUpdate(ex.listing, { status: "PENDING" });

  res.json({ exchange: ex });
}

export async function rejectExchange(req, res) {
  const { id } = req.params;

  const ex = await ExchangeRequest.findById(id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });

  if (String(ex.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (ex.status !== "PENDING") {
    return res.status(400).json({ message: "Exchange already processed" });
  }

  ex.status = "REJECTED";
  await ex.save();

  res.json({ exchange: ex });
}

export async function cancelExchange(req, res) {
  const { id } = req.params;

  const ex = await ExchangeRequest.findById(id);
  if (!ex) return res.status(404).json({ message: "Exchange not found" });

  // only requester/buyer can cancel
  if (String(ex.requester) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (ex.status !== "PENDING") {
    return res.status(400).json({ message: "Cannot cancel processed exchange" });
  }

  ex.status = "CANCELLED";
  await ex.save();

  res.json({ exchange: ex });
}