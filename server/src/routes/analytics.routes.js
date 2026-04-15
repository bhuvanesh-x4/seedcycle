// ============================================================
// Feature 5: Analytics Dashboard (Full-Stack)
// Add to: server/src/routes/analytics.routes.js
// Register in app.js: app.use("/api/analytics", analyticsRoutes);
// ============================================================

import { Router } from "express";
import User from "../models/User.js";
import SeedListing from "../models/SeedListing.js";
import ExchangeRequest from "../models/ExchangeRequest.js";
import FeedPost from "../models/FeedPost.js";

const router = Router();

// ── GET /api/analytics/overview ───────────────────────────
router.get("/overview", async (req, res) => {
  try {
    // Run all queries in parallel
    const [
      totalUsers,
      totalListings,
      totalExchanges,
      approvedExchanges,
      totalPosts,
      recentUsers,
      seedTypeStats,
      listingsOverTime,
      topContributors,
      exchangeKindStats,
    ] = await Promise.all([
      // 1. Total counts
      User.countDocuments(),
      SeedListing.countDocuments(),
      ExchangeRequest.countDocuments(),
      ExchangeRequest.countDocuments({ status: "APPROVED" }),
      FeedPost.countDocuments(),

      // 2. Recent user signups (last 30 days)
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),

      // 3. Seed types breakdown
      SeedListing.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // 4. Listings created per month (last 6 months)
      SeedListing.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // 5. Top contributors by points
      User.find({})
        .sort({ points: -1 })
        .limit(5)
        .select("name points badges exchangesCompleted avatarUrl"),

      // 6. Exchange type breakdown (BUY vs EXCHANGE)
      ExchangeRequest.aggregate([
        { $group: { _id: "$kind", count: { $sum: 1 } } },
      ]),
    ]);

    // Calculate exchange success rate
    const exchangeSuccessRate =
      totalExchanges > 0
        ? Math.round((approvedExchanges / totalExchanges) * 100)
        : 0;

    // Format listings over time for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const listingsTimeline = listingsOverTime.map((item) => ({
      month: months[item._id.month - 1] + " " + item._id.year,
      count: item.count,
    }));

    res.json({
      summary: {
        totalUsers,
        totalListings,
        totalExchanges,
        approvedExchanges,
        exchangeSuccessRate,
        totalPosts,
        recentUsers,
      },
      charts: {
        seedTypes: seedTypeStats.map((s) => ({
          type: s._id || "Unknown",
          count: s.count,
        })),
        listingsTimeline,
        exchangeKinds: exchangeKindStats.map((e) => ({
          kind: e._id,
          count: e.count,
        })),
      },
      topContributors: topContributors.map((u) => ({
        name: u.name,
        points: u.points || 0,
        badges: u.badges?.length || 0,
        exchanges: u.exchangesCompleted || 0,
        avatarUrl: u.avatarUrl,
      })),
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;

// ============================================================
// REGISTER IN app.js:
//
// import analyticsRoutes from "./routes/analytics.routes.js";
// app.use("/api/analytics", analyticsRoutes);
// ============================================================
