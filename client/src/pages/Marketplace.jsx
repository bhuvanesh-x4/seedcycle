import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import TiltCard from "../components/ui/TiltCard.jsx";
import VineLoader from "../components/ui/VineLoader.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { api } from "../app/api.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";

// Fix default marker icons in Vite
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow
});

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

// Helper function to format timestamps
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Marketplace() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [err, setErr] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price_low, price_high
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Default center (edit as you like)
  const center = useMemo(() => ({ lat: 15.3647, lng: 75.1240 }), []); // Dharwad-ish

  const fetchNear = async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await api.get("/seeds/near", {
        params: { lng: center.lng, lat: center.lat, radiusKm: 50 }
      });
      setListings(data.listings || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load map listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(query) ||
        l.type?.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        l.owner?.name?.toLowerCase().includes(query)
      );
    }

    // Verified filter
    if (verifiedOnly) {
      result = result.filter(l => l.owner?.isVerifiedCompany);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "price_low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [listings, searchQuery, sortBy, verifiedOnly]);

  // Count verified listings
  const verifiedCount = useMemo(() =>
    listings.filter(l => l.owner?.isVerifiedCompany).length,
    [listings]
  );

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-neonTeal">Marketplace</h2>
          <p className="mt-2 text-white/70">Discover nearby seeds & plants</p>
        </div>

        <button
          onClick={fetchNear}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-neonTeal/90 hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-6 space-y-4">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, type, or seller..."
              className="w-full rounded-xl bg-black/20 border border-white/10 pl-12 pr-4 py-3 outline-none focus:border-neonTeal/60 text-white placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl border px-4 py-3 flex items-center gap-2 transition ${showFilters || verifiedOnly || sortBy !== "newest"
              ? "border-neonTeal/60 bg-neonTeal/10 text-neonTeal"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-4">
              {/* Sort By */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-white/60 text-sm block mb-2">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "newest", label: "Newest First", icon: "↓" },
                    { value: "oldest", label: "Oldest First", icon: "↑" },
                    { value: "price_low", label: "Price: Low → High", icon: "₹↑" },
                    { value: "price_high", label: "Price: High → Low", icon: "₹↓" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition ${sortBy === option.value
                        ? "bg-neonTeal text-midnight font-medium"
                        : "bg-black/20 border border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Only */}
              <div className="min-w-[200px]">
                <label className="text-white/60 text-sm block mb-2">Seller Type</label>
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`rounded-xl px-4 py-2 flex items-center gap-2 transition ${verifiedOnly
                    ? "bg-blue-600 text-white border border-blue-500"
                    : "bg-black/20 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                >
                  <VerifiedBadge size="sm" showTooltip={false} />
                  <span>Verified Companies Only</span>
                  {verifiedCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${verifiedOnly ? "bg-blue-500" : "bg-white/10"
                      }`}>
                      {verifiedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || verifiedOnly || sortBy !== "newest") && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-white/50 text-sm">Active:</span>
                {searchQuery && (
                  <span className="text-xs bg-neonTeal/20 text-neonTeal px-2 py-1 rounded-lg flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-white">×</button>
                  </span>
                )}
                {verifiedOnly && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg flex items-center gap-1">
                    Verified Only
                    <button onClick={() => setVerifiedOnly(false)} className="hover:text-white">×</button>
                  </span>
                )}
                {sortBy !== "newest" && (
                  <span className="text-xs bg-neonPink/20 text-neonPink px-2 py-1 rounded-lg flex items-center gap-1">
                    Sort: {sortBy.replace("_", " ")}
                    <button onClick={() => setSortBy("newest")} className="hover:text-white">×</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setVerifiedOnly(false);
                    setSortBy("newest");
                  }}
                  className="text-xs text-white/50 hover:text-white/80 ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="text-white/50 text-sm">
            Showing {filteredListings.length} of {listings.length} listings
            {verifiedOnly && ` (verified only)`}
          </div>
        )}
      </div>

      {/* Verified Official Accounts Section */}
      {!loading && verifiedCount > 0 && !verifiedOnly && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <VerifiedBadge size="sm" showTooltip={false} />
              </div>
              <div>
                <h3 className="font-display text-xl text-white flex items-center gap-2">
                  Verified Official Accounts
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {verifiedCount} listings
                  </span>
                </h3>
                <p className="text-white/50 text-sm">Trusted sellers verified with GST</p>
              </div>
            </div>
            <button
              onClick={() => setVerifiedOnly(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {listings
                .filter(l => l.owner?.isVerifiedCompany)
                .slice(0, 10)
                .map((l) => (
                  <Link
                    key={l._id}
                    to={`/listing/${l._id}`}
                    className="flex-shrink-0 w-72 group"
                  >
                    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-4 hover:border-blue-500/50 hover:bg-blue-900/30 transition-all duration-300">
                      {/* Image */}
                      <div className="h-32 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 mb-3">
                        {l.photoUrl ? (
                          <img
                            src={`${API_ORIGIN}${l.photoUrl}`}
                            alt={l.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-lg text-white line-clamp-1 flex items-center gap-1.5">
                            {l.title}
                            <VerifiedBadge size="sm" />
                          </h4>
                          <span className="text-neonPink font-bold whitespace-nowrap">
                            ₹{l.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/60">{l.type}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-white/60">Qty: {l.quantity}</span>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs text-white font-bold">
                            {l.owner?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white/80 text-sm truncate">
                              {l.owner?.companyDetails?.companyName || l.owner?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

              {/* View All Card */}
              <button
                onClick={() => setVerifiedOnly(true)}
                className="flex-shrink-0 w-48 rounded-2xl border border-dashed border-blue-500/30 bg-blue-900/10 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <span className="text-blue-400 font-medium">View All Verified</span>
                <span className="text-white/40 text-sm">{verifiedCount} listings</span>
              </button>
            </div>

            {/* Gradient Fade on Right */}
            <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-midnight to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* MAP */}
        <div className="h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <MapContainer center={[center.lat, center.lng]} zoom={7} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredListings.map((l) => (
              <Marker key={l._id} position={[l.location.coordinates[1], l.location.coordinates[0]]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold flex items-center gap-1">
                      {l.title}
                      {l.owner?.isVerifiedCompany && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <div>Type: {l.type}</div>
                    <div>Qty: {l.quantity}</div>
                    <div>Price: ₹{l.price}</div>
                    <div className="mt-2">
                      <Link
                        to={`/listing/${l._id}`}
                        className="text-neonPink underline"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* LIST */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
          {loading ? (
            <VineLoader label="Fetching listings near you..." />
          ) : err ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-neonPink">{err}</div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70 text-center">
              {searchQuery || verifiedOnly ? (
                <>
                  <div className="text-2xl mb-2">🔍</div>
                  <div>No listings match your filters.</div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setVerifiedOnly(false);
                    }}
                    className="mt-2 text-neonTeal hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                "No nearby listings found. Create one!"
              )}
            </div>
          ) : (
            filteredListings.map((l) => (
              <Link key={l._id} to={`/listing/${l._id}`} className="block">
                <TiltCard>
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      {l.photoUrl ? (
                        <img
                          src={`${API_ORIGIN}${l.photoUrl}`}
                          alt={l.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="font-display text-lg text-neonTeal flex items-center gap-1.5">
                          {l.title}
                          {l.owner?.isVerifiedCompany && <VerifiedBadge size="sm" />}
                        </div>
                        <div className="text-neonPink font-semibold whitespace-nowrap">
                          ₹{l.price}
                        </div>
                      </div>
                      <div className="text-white/70 text-sm">
                        {l.type} · Qty {l.quantity}
                        {l.owner?.name && <span className="text-white/50"> · by {l.owner.name}</span>}
                      </div>
                      <div className="mt-1 text-white/60 text-xs line-clamp-1">
                        {l.description || "—"}
                      </div>
                      {l.createdAt && (
                        <div className="mt-1 text-white/50 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimeAgo(l.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

