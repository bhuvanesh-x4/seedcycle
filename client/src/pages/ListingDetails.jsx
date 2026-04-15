import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import VineLoader from "../components/ui/VineLoader.jsx";
import VerifiedBadge from "../components/ui/VerifiedBadge.jsx";
import { api } from "../app/api.js";
import { useAuthStore } from "../app/store/authStore.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: shadow });

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

// Helper function to format timestamps
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ListingDetails() {
  const { id } = useParams();
  const user = useAuthStore(s => s.user);

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [err, setErr] = useState(null);

  // request UI
  const [kind, setKind] = useState("BUY");
  const [message, setMessage] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [offeredListingId, setOfferedListingId] = useState("");
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState(null);

  const pos = useMemo(() => {
    if (!listing?.location?.coordinates) return null;
    return [listing.location.coordinates[1], listing.location.coordinates[0]];
  }, [listing]);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await api.get(`/seeds/${id}`);
      setListing(data.listing);

      // preload my listings (for EXCHANGE)
      if (user) {
        const mine = await api.get("/seeds/mine");
        setMyListings(mine.data.listings || []);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const sendRequest = async () => {
    if (!user) return;

    try {
      setSending(true);
      setOkMsg(null);

      const body = {
        listingId: listing._id,
        kind,
        message
      };

      if (kind === "BUY") {
        body.offeredPrice = offeredPrice !== "" ? Number(offeredPrice) : listing.price;
      } else {
        body.offeredListingId = offeredListingId;
      }

      await api.post("/exchanges", body);
      setOkMsg("Request sent to seller ✅");
      setMessage("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageShell><VineLoader label="Loading listing..." /></PageShell>;
  if (err) return <PageShell><GlassCard className="text-neonPink">{err}</GlassCard></PageShell>;
  if (!listing) return null;

  const owner = listing.owner;

  return (
    <PageShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-neonTeal">{listing.title}</h2>
          <p className="mt-2 text-white/70">{listing.type} · Qty {listing.quantity}</p>
          {listing.createdAt && (
            <p className="mt-1 text-white/50 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Listed on {formatDate(listing.createdAt)}
            </p>
          )}
        </div>
        <MagneticButton className="px-4 py-2 text-sm">Back to Marketplace</MagneticButton>

      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <GlassCard>
          <div className="flex gap-4">
            <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {listing.photoUrl ? (
                <img src={`${API_ORIGIN}${listing.photoUrl}`} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-white/40 text-xs">No Photo</div>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-white/70 text-sm">Price</div>
              <div className="font-display text-2xl text-neonPink">
                {listing.currency || "INR"} {listing.price}
              </div>
              <div className="mt-2 text-white/70 text-sm">Description</div>
              <div className="text-white/80">{listing.description || "—"}</div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="text-neonTeal font-display text-xl">Seller Details</div>
            <div className="mt-2 text-white/80 flex items-center gap-2">
              Name: <span className="text-neonTeal flex items-center gap-1.5">
                {owner?.name || "—"}
                {owner?.isVerifiedCompany && <VerifiedBadge size="sm" />}
              </span>
            </div>
            {owner?.isVerifiedCompany && owner?.companyDetails?.companyName && (
              <div className="text-blue-400 text-sm flex items-center gap-1.5 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                {owner.companyDetails.companyName}
                <span className="text-white/40">· GST: {owner.companyDetails.gstNumber}</span>
              </div>
            )}
            <div className="text-white/80">Email: <span className="text-white/70">{owner?.email || "—"}</span></div>
            <div className="text-white/80">Phone: <span className="text-white/70">{owner?.phone || "—"}</span></div>

            {pos && (
              <div className="mt-4 text-white/60 text-sm">
                Location: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
              </div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="h-[320px] overflow-hidden p-0">
            {pos ? (
              <MapContainer center={pos} zoom={12} className="h-[320px] w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={pos}>
                  <Popup>{listing.title}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-[320px] grid place-items-center text-white/60">No location</div>
            )}
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="font-display text-xl text-neonTeal">Buy / Exchange</div>
              {!user && <Link to="/auth" className="text-neonPink underline text-sm">Login to request</Link>}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setKind("BUY")}
                  className={"rounded-xl px-4 py-2 border border-white/10 " + (kind === "BUY" ? "bg-neonPink text-midnight" : "bg-white/5 text-neonTeal/90 hover:bg-white/10")}
                >
                  Buy
                </button>
                <button
                  onClick={() => setKind("EXCHANGE")}
                  className={"rounded-xl px-4 py-2 border border-white/10 " + (kind === "EXCHANGE" ? "bg-neonPink text-midnight" : "bg-white/5 text-neonTeal/90 hover:bg-white/10")}
                >
                  Exchange
                </button>
              </div>

              {kind === "BUY" ? (
                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  placeholder={`Offer price (default ${listing.price})`}
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                />
              ) : (
                <select
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  value={offeredListingId}
                  onChange={(e) => setOfferedListingId(e.target.value)}
                >
                  <option value="">Select your listing to offer</option>
                  {myListings.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.title} (Qty {l.quantity})
                    </option>
                  ))}
                </select>
              )}

              <textarea
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                rows={3}
                placeholder="Message to seller..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {okMsg && <div className="text-sm text-neonTeal">{okMsg}</div>}
              {err && <div className="text-sm text-neonPink">{err}</div>}

              <MagneticButton
                disabled={!user || sending || (kind === "EXCHANGE" && !offeredListingId)}
                onClick={sendRequest}
                className="w-full justify-center disabled:opacity-60"
              >
                {sending ? "Sending..." : (kind === "BUY" ? "Send Buy Request" : "Send Exchange Request")}
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
