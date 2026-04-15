import SeedListing from "../models/SeedListing.js";
import User from "../models/User.js";
import { POINTS, computeBadges } from "../utils/points.js";
import { toPoint } from "../utils/geo.js";

export async function createListing(req, res) {
  const { title, type, quantity, price, currency, description, lng, lat } = req.validated.body;


  const point = toPoint(lng, lat);
  if (!point) return res.status(400).json({ message: "Invalid coordinates" });

  const photoUrl = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : undefined;

  const listing = await SeedListing.create({
    owner: req.user._id,
    title,
    type,
    quantity,
    description: description || "",
    price,
    currency: currency || "INR",

    photoUrl,
    location: point
  });

  // gamification
  const user = await User.findById(req.user._id);
  user.points += POINTS.LISTING_CREATE;
  user.badges = computeBadges(user);
  await user.save();

  res.status(201).json({ listing });
}

export async function listListings(req, res) {
  const { q, status } = req.query;
  const query = {};

  if (status) query.status = status;
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { type: { $regex: q, $options: "i" } }
    ];
  }

  const listings = await SeedListing.find(query)
    .populate("owner", "name avatarUrl points badges accountType companyDetails")
    .sort({ createdAt: -1 })
    .limit(100);

  // Add isVerifiedCompany flag to each listing owner
  const listingsWithFlag = listings.map(l => {
    const listing = l.toObject();
    if (listing.owner) {
      listing.owner.isVerifiedCompany =
        listing.owner.accountType === "company" &&
        listing.owner.companyDetails?.verificationStatus === "verified";
    }
    return listing;
  });

  res.json({ listings: listingsWithFlag });
}

export async function getListing(req, res) {
  const listing = await SeedListing.findById(req.params.id)
    .populate("owner", "name avatarUrl email phone accountType companyDetails");

  if (!listing) return res.status(404).json({ message: "Listing not found" });

  // Add isVerifiedCompany flag to owner
  const result = listing.toObject();
  if (result.owner) {
    result.owner.isVerifiedCompany =
      result.owner.accountType === "company" &&
      result.owner.companyDetails?.verificationStatus === "verified";
  }

  res.json({ listing: result });
}
export async function myListings(req, res) {
  const listings = await SeedListing.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ listings });
}


export async function updateListing(req, res) {
  const listing = await SeedListing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  if (String(listing.owner) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  const { title, type, quantity, description, status, lng, lat } = req.body;

  if (typeof title === "string" && title.trim()) listing.title = title.trim();
  if (typeof type === "string" && type.trim()) listing.type = type.trim();
  if (quantity != null) listing.quantity = Math.max(1, Number(quantity));
  if (typeof description === "string") listing.description = description;
  if (status && ["AVAILABLE", "ON_HOLD", "EXCHANGED"].includes(status)) listing.status = status;

  if (lng != null && lat != null) {
    const point = toPoint(lng, lat);
    if (point) listing.location = point;
  }

  const photoUrl = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null;
  if (photoUrl) listing.photoUrl = photoUrl;

  await listing.save();
  res.json({ listing });
}

export async function deleteListing(req, res) {
  const listing = await SeedListing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  if (String(listing.owner) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await listing.deleteOne();
  res.json({ ok: true });
}

export async function nearListings(req, res) {
  const { lng, lat, radiusKm } = req.validated.query;

  const listings = await SeedListing.find({
    status: "AVAILABLE",
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000
      }
    }
  })
    .populate("owner", "name avatarUrl points badges accountType companyDetails")
    .limit(200);

  // Add isVerifiedCompany flag to each listing owner
  const listingsWithFlag = listings.map(l => {
    const listing = l.toObject();
    if (listing.owner) {
      listing.owner.isVerifiedCompany =
        listing.owner.accountType === "company" &&
        listing.owner.companyDetails?.verificationStatus === "verified";
    }
    return listing;
  });

  res.json({ listings: listingsWithFlag });
}
