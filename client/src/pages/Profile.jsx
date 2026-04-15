import { useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { useAuthStore } from "../app/store/authStore.js";
import { api } from "../app/api.js";
import { Link } from "react-router-dom";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);


  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [lng, setLng] = useState(user?.homeLocation?.coordinates?.[0] ?? "75.1240");
  const [lat, setLat] = useState(user?.homeLocation?.coordinates?.[1] ?? "15.3647");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg(null);
      await api.patch("/user/profile", { name, bio, phone, lng, lat });

      await fetchMe();
      setMsg("Saved!");
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      {!user ? (
        <div className="text-white/70">
          Login to edit profile. <Link className="text-neonPink underline" to="/auth">Login</Link>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Profile Header with Verified Badge */}
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neonTeal to-neonPink flex items-center justify-center text-2xl font-bold text-midnight">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-3xl text-neonTeal">{user.name}</h2>
                  {user.isVerifiedCompany && <VerifiedBadge size="md" />}
                </div>
                <p className="text-white/60">{user.email}</p>
                {user.isVerifiedCompany && user.companyDetails?.companyName && (
                  <p className="text-blue-400 text-sm flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {user.companyDetails.companyName}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Company Verification Section */}
          {!user.isVerifiedCompany ? (
            <GlassCard className="border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-white flex items-center gap-2">
                    Get Verified
                    <VerifiedBadge size="sm" showTooltip={false} />
                  </h3>
                  <p className="mt-1 text-white/60 text-sm">
                    Verify your business with GST to get the verified badge and build trust with buyers.
                  </p>
                  <Link
                    to="/company-verification"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify as Company
                  </Link>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="border-blue-500/30 bg-blue-900/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0">
                  <VerifiedBadge size="md" showTooltip={false} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-blue-400">Verified Company</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">GST Number</span>
                      <span className="text-white font-mono">{user.companyDetails?.gstNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Verified On</span>
                      <span className="text-white">
                        {user.companyDetails?.verifiedAt
                          ? new Date(user.companyDetails.verifiedAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Edit Profile Form */}
          <GlassCard>
            <h3 className="font-display text-xl text-neonTeal mb-4">Edit Profile</h3>

            <form onSubmit={save} className="grid gap-3">
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />

              <textarea
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio (optional)"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Home Longitude"
                />
                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Home Latitude"
                />
              </div>

              {msg && <div className={"text-sm " + (msg === "Saved!" ? "text-neonTeal" : "text-neonPink")}>{msg}</div>}

              <button
                disabled={loading}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}

