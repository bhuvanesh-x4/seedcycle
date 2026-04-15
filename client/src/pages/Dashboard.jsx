import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { useAuthStore } from "../app/store/authStore.js";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <PageShell>
      {!user ? (
        <div className="text-white/70">
          You're not logged in. <Link className="text-neonPink underline" to="/auth">Login</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard className="md:col-span-2">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl text-neonTeal">Welcome, {user.name}</h2>
              {user.isVerifiedCompany && <VerifiedBadge size="md" />}
            </div>
            <p className="mt-2 text-white/70">
              This dashboard shows your eco-impact progress, badges, and quick actions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/list" className="rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition">
                Create Listing
              </Link>
              <Link to="/market" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-neonTeal/90 hover:bg-white/10 transition">
                Explore Marketplace
              </Link>
              <Link to="/feed" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-neonTeal/90 hover:bg-white/10 transition">
                Community Feed
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-neonTeal/80 text-sm">Gamification</div>
            <div className="mt-2 text-4xl font-display text-neonPink">{user.points}</div>
            <div className="text-white/70 text-sm">points</div>

            <div className="mt-6">
              <div className="text-neonTeal/80 text-sm">Badges</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(user.badges || []).length === 0 ? (
                  <span className="text-white/60 text-sm">No badges yet — keep contributing!</span>
                ) : (
                  user.badges.map((b) => (
                    <span key={b.key} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neonTeal">
                      {b.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          </GlassCard>

          {/* Company Verification Section */}
          <GlassCard className="md:col-span-3">
            {user.isVerifiedCompany ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <VerifiedBadge size="md" showTooltip={false} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-blue-400 flex items-center gap-2">
                    Verified Company
                    <VerifiedBadge size="sm" />
                  </h3>
                  <p className="text-white/60 text-sm">
                    {user.companyDetails?.companyName} • GST: {user.companyDetails?.gstNumber}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View Details →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-white flex items-center gap-2">
                    Get Verified as a Company
                    <VerifiedBadge size="sm" showTooltip={false} />
                  </h3>
                  <p className="text-white/60 text-sm">
                    Verify your business with GST to get the verified badge and build trust with buyers
                  </p>
                </div>
                <Link
                  to="/company-verification"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-medium text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Now
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}

