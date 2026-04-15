// ============================================================
// Feature 5: Analytics Dashboard
// Add to: client/src/pages/Analytics.jsx
// Add route: { path: "/analytics", element: <Analytics /> }
// ============================================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../app/api";
import {
  Users, Package, ArrowLeftRight, MessageSquare,
  TrendingUp, Award, BarChart3, Loader2, PieChart
} from "lucide-react";
import PageShell from "../components/layout/PageShell";

// ── Simple Chart Components (no extra dependencies) ───────

function BarChartSimple({ data, label = "count", nameKey = "type" }) {
  const maxVal = Math.max(...data.map((d) => d[label]), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm text-green-300/70 w-24 text-right truncate">
            {item[nameKey]}
          </span>
          <div className="flex-1 bg-green-900/30 rounded-full h-7 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item[label] / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
              {item[label]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PieChartSimple({ data, label = "count", nameKey = "kind" }) {
  const total = data.reduce((sum, d) => sum + d[label], 0) || 1;
  const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

  return (
    <div className="flex items-center gap-6">
      {/* Simple visual representation */}
      <div className="flex gap-1 h-32 items-end">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(item[label] / total) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            className="w-14 rounded-t-lg"
            style={{ backgroundColor: colors[i % colors.length], minHeight: "20px" }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-sm text-green-300/80">
              {item[nameKey]} — {item[label]} ({Math.round((item[label] / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-green-800/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-5"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-green-400/60">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/overview");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="ml-3 text-green-300">Loading analytics...</span>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="min-h-screen bg-gradient-to-b from-green-950 to-emerald-950 flex items-center justify-center">
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">
            {error}
          </div>
        </div>
      </PageShell>
    );
  }

  const { summary, charts, topContributors } = data;

  return (
    <PageShell>
      <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-emerald-300 flex items-center justify-center gap-3">
              <BarChart3 className="w-10 h-10" />
              Platform Analytics
            </h1>
            <p className="text-green-400/70 mt-2">
              Real-time insights from SeedCycle
            </p>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users} label="Total Users" value={summary.totalUsers}
              color="bg-blue-600" delay={0}
            />
            <StatCard
              icon={Package} label="Seed Listings" value={summary.totalListings}
              color="bg-emerald-600" delay={0.1}
            />
            <StatCard
              icon={ArrowLeftRight} label="Exchanges" value={summary.totalExchanges}
              color="bg-amber-600" delay={0.2}
            />
            <StatCard
              icon={MessageSquare} label="Feed Posts" value={summary.totalPosts}
              color="bg-purple-600" delay={0.3}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-green-800/20 border border-green-700/30 rounded-xl p-5 text-center"
            >
              <p className="text-4xl font-bold text-emerald-400">
                {summary.exchangeSuccessRate}%
              </p>
              <p className="text-sm text-green-400/60 mt-1">Exchange Success Rate</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-green-800/20 border border-green-700/30 rounded-xl p-5 text-center"
            >
              <p className="text-4xl font-bold text-blue-400">
                {summary.recentUsers}
              </p>
              <p className="text-sm text-green-400/60 mt-1">New Users (30 days)</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-green-800/20 border border-green-700/30 rounded-xl p-5 text-center"
            >
              <p className="text-4xl font-bold text-amber-400">
                {summary.approvedExchanges}
              </p>
              <p className="text-sm text-green-400/60 mt-1">Successful Exchanges</p>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Seed Types Chart */}
            {charts.seedTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-green-800/20 border border-green-700/30 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Popular Seed Types
                </h3>
                <BarChartSimple data={charts.seedTypes} />
              </motion.div>
            )}

            {/* Exchange Kinds */}
            {charts.exchangeKinds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-green-800/20 border border-green-700/30 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Exchange Types (Buy vs Exchange)
                </h3>
                <PieChartSimple data={charts.exchangeKinds} />
              </motion.div>
            )}
          </div>

          {/* Top Contributors */}
          {topContributors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-green-800/20 border border-green-700/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Contributors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topContributors.map((user, i) => (
                  <div
                    key={i}
                    className="bg-green-900/30 rounded-lg p-4 text-center border border-green-800/40"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg mb-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          className="w-12 h-12 rounded-full object-cover"
                          alt={user.name}
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-emerald-400 text-sm">{user.points} pts</p>
                    <p className="text-green-400/50 text-xs">
                      {user.exchanges} exchanges · {user.badges} badges
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
