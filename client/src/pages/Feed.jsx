import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import VineLoader from "../components/ui/VineLoader.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { api } from "../app/api.js";
import { useAuthStore } from "../app/store/authStore.js";
import { Link } from "react-router-dom";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export default function Feed() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState(null);

  // Connect Users Panel State
  const [showConnectPanel, setShowConnectPanel] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // User Profile Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await api.get("/feed");
      setPosts(data.posts || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (search = "") => {
    if (!user) return;
    try {
      setUsersLoading(true);
      const { data } = await api.get("/user/all", { params: { search } });
      setAllUsers(data.users || []);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showConnectPanel && user) {
      loadUsers();
    }
  }, [showConnectPanel, user]);

  useEffect(() => {
    if (!showConnectPanel) return;
    const timer = setTimeout(() => {
      loadUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const create = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setPosting(true);
      const fd = new FormData();
      fd.append("content", content);
      if (photo) fd.append("photo", photo);

      await api.post("/feed", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setContent("");
      setPhoto(null);
      await fetchMe();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const openUserProfile = (u) => {
    setSelectedUser(u);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <PageShell>
      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeProfileModal}
        >
          <div
            className="relative w-full max-w-lg bg-gradient-to-br from-midnight/95 to-deepPurple/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-neonTeal/30 via-neonPink/20 to-neonTeal/30">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neonTeal/40 to-neonPink/40 flex items-center justify-center text-3xl font-bold text-white border-4 border-midnight overflow-hidden">
                  {selectedUser.avatarUrl ? (
                    <img src={`${API_ORIGIN}${selectedUser.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 px-6 pb-6">
              {/* Name & Verification */}
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl text-white">{selectedUser.name}</h3>
                {selectedUser.isVerifiedCompany && <VerifiedBadge size="md" />}
              </div>

              {/* Company Name */}
              {selectedUser.isVerifiedCompany && selectedUser.companyName && (
                <div className="text-neonTeal text-sm mt-1">{selectedUser.companyName}</div>
              )}

              {/* Email */}
              <div className="text-white/50 text-sm mt-1">{selectedUser.email}</div>

              {/* Bio */}
              {selectedUser.bio && (
                <p className="text-white/70 mt-4 text-sm leading-relaxed">{selectedUser.bio}</p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-black/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-neonPink">{selectedUser.points || 0}</div>
                  <div className="text-white/50 text-xs mt-1">Points</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-neonTeal">{selectedUser.badges?.length || 0}</div>
                  <div className="text-white/50 text-xs mt-1">Badges</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-brightYellow capitalize">{selectedUser.accountType || "Individual"}</div>
                  <div className="text-white/50 text-xs mt-1">Account</div>
                </div>
              </div>

              {/* Badges */}
              {selectedUser.badges && selectedUser.badges.length > 0 && (
                <div className="mt-6">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Badges Earned</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-neonTeal/20 to-neonPink/20 border border-white/10 text-xs text-white"
                      >
                        🏆 {badge.label || badge.key}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="mt-6 text-white/40 text-xs">
                Member since {formatDate(selectedUser.createdAt)}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neonTeal/20 hover:bg-neonTeal/30 text-neonTeal transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </a>
                <Link
                  to="/market"
                  onClick={closeProfileModal}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neonPink/20 hover:bg-neonPink/30 text-neonPink transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  View Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-neonTeal">Community Feed</h2>
          <p className="mt-2 text-white/70">Share tips, updates, and eco wins.</p>
        </div>
        <div className="flex gap-2">
          {user && (
            <button
              onClick={() => setShowConnectPanel(!showConnectPanel)}
              className={`rounded-xl border px-4 py-2 transition flex items-center gap-2 ${showConnectPanel
                  ? "border-neonPink bg-neonPink/10 text-neonPink"
                  : "border-white/10 bg-white/5 text-neonTeal/90 hover:bg-white/10"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connect
            </button>
          )}
          <button
            onClick={load}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-neonTeal/90 hover:bg-white/10 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Connect Users Panel */}
      {showConnectPanel && user && (
        <GlassCard className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neonPink/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-neonPink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-white">Connect with Users</h3>
                <p className="text-white/50 text-sm">Click on a user to view their profile</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectPanel(false)}
              className="text-white/40 hover:text-white/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name, email, or company..."
              className="w-full rounded-xl bg-black/30 border border-white/10 pl-12 pr-4 py-3 outline-none focus:border-neonTeal/60 text-white placeholder:text-white/40"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Users List */}
          <div className="max-h-[400px] overflow-y-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <VineLoader label="Loading users..." />
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                {userSearch ? "No users found matching your search" : "No other users registered yet"}
              </div>
            ) : (
              <div className="grid gap-3">
                {allUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => openUserProfile(u)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-neonTeal/30 hover:bg-black/30 transition cursor-pointer group"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonTeal/30 to-neonPink/30 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-neonTeal/50 transition">
                      {u.avatarUrl ? (
                        <img src={`${API_ORIGIN}${u.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.name?.charAt(0)?.toUpperCase() || "?"
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-white truncate group-hover:text-neonTeal transition">{u.name}</span>
                        {u.isVerifiedCompany && <VerifiedBadge size="sm" />}
                      </div>
                      <div className="text-white/50 text-sm truncate">
                        {u.isVerifiedCompany && u.companyName ? u.companyName : u.email}
                      </div>
                      {u.bio && (
                        <div className="text-white/40 text-xs mt-1 line-clamp-1">{u.bio}</div>
                      )}
                    </div>

                    {/* Stats & View Profile */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-neonPink font-semibold">{u.points}</div>
                        <div className="text-white/40 text-xs">points</div>
                      </div>
                      <div className="rounded-lg bg-white/5 group-hover:bg-neonTeal/20 px-3 py-2 text-xs text-white/60 group-hover:text-neonTeal transition">
                        View Profile →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {allUsers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10 text-center text-white/40 text-sm">
              Showing {allUsers.length} users {userSearch && `matching "${userSearch}"`}
            </div>
          )}
        </GlassCard>
      )}

      {!user ? (
        <GlassCard className="mt-6 text-white/70">
          Login to post. <Link className="text-neonPink underline" to="/auth">Login</Link>
        </GlassCard>
      ) : (
        <GlassCard className="mt-6">
          <form onSubmit={create} className="grid gap-3">
            <textarea
              className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
              rows={3}
              placeholder="Share a gardening tip..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-2 outline-none focus:border-neonTeal/60"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <button
                disabled={posting}
                className="rounded-xl bg-neonPink px-5 py-2 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="mt-6">
        {loading ? (
          <VineLoader label="Loading feed..." />
        ) : err ? (
          <GlassCard className="text-neonPink">{err}</GlassCard>
        ) : (
          <div className="grid gap-4">
            {posts.map((p) => (
              <GlassCard key={p._id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-neonTeal">{p.author?.name || "User"}</div>
                    <div className="text-white/60 text-xs">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-neonPink">{p.author?.points || 0} pts</div>
                </div>
                <div className="mt-3 text-white/80">{p.content}</div>
                {p.photoUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                    <img src={`${API_ORIGIN}${p.photoUrl}`} alt="" className="w-full max-h-[420px] object-cover" />
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
