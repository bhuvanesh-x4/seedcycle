import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import VineLoader from "../components/ui/VineLoader.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { api } from "../app/api.js";

function getTitle(listing) {
  if (!listing) return "Unknown listing";
  if (typeof listing === "string") return listing; // if backend returned only id
  return listing.title || "Untitled listing";
}

export default function Exchanges() {
  const [tab, setTab] = useState("inbox"); // inbox | outbox
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  const load = async (which = tab) => {
    try {
      setLoading(true);
      setErr(null);
      const url = which === "inbox" ? "/exchanges/inbox" : "/exchanges/outbox";
      const { data } = await api.get(url);
      setItems(data.exchanges || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load exchanges");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Action handlers (match these with your server routes)
  const approve = async (id) => {
    try {
      await api.post(`/exchanges/${id}/approve`);
      load("inbox");
    } catch (e) {
      setErr(e?.response?.data?.message || "Approve failed");
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/exchanges/${id}/reject`);
      load("inbox");
    } catch (e) {
      setErr(e?.response?.data?.message || "Reject failed");
    }
  };

  const cancel = async (id) => {
    try {
      await api.post(`/exchanges/${id}/cancel`);
      load("outbox");
    } catch (e) {
      setErr(e?.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-neonTeal">Exchanges</h2>
          <p className="mt-2 text-white/70">Request/Approve/Reject flow.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("inbox")}
            className={
              "rounded-xl border px-4 py-2 transition " +
              (tab === "inbox"
                ? "border-white/10 bg-neonPink text-midnight"
                : "border-white/10 bg-white/5 text-neonTeal/90 hover:bg-white/10")
            }
          >
            Inbox
          </button>
          <button
            onClick={() => setTab("outbox")}
            className={
              "rounded-xl border px-4 py-2 transition " +
              (tab === "outbox"
                ? "border-white/10 bg-neonPink text-midnight"
                : "border-white/10 bg-white/5 text-neonTeal/90 hover:bg-white/10")
            }
          >
            Outbox
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <VineLoader label="Loading exchanges..." />
        ) : err ? (
          <GlassCard className="text-neonPink">{err}</GlassCard>
        ) : items.length === 0 ? (
          <GlassCard className="text-white/70">No exchanges here yet.</GlassCard>
        ) : (
          items.map((x) => {
            const listingTitle = getTitle(x.listing);
            const kind = x.kind || "EXCHANGE";
            const status = x.status || "PENDING";

            // offeredListing might be object or id or null
            const offeredTitle =
              kind === "EXCHANGE"
                ? getTitle(x.offeredListing)
                : null;

            const offerPrice =
              kind === "BUY"
                ? (x.offeredPrice ?? "—")
                : null;

            return (
              <GlassCard key={x._id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-neonTeal truncate">
                      {listingTitle}
                    </div>

                    <div className="mt-1 text-sm text-white/70">
                      Type: <span className="text-neonPink">{kind}</span> ·
                      Status: <span className="text-neonTeal">{status}</span>
                    </div>

                    {kind === "BUY" && (
                      <div className="mt-1 text-sm text-white/70">
                        Offered Price: <span className="text-neonPink">{offerPrice}</span>
                      </div>
                    )}

                    {kind === "EXCHANGE" && (
                      <div className="mt-1 text-sm text-white/70">
                        Offered Listing: <span className="text-neonPink">{offeredTitle || "—"}</span>
                      </div>
                    )}

                    {x.message && (
                      <div className="mt-2 text-sm text-white/60">
                        Message: {x.message}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {tab === "inbox" ? (
                      <>
                        <MagneticButton
                          onClick={() => approve(x._id)}
                          className="px-4 py-2"
                          disabled={status !== "PENDING"}
                        >
                          Approve
                        </MagneticButton>
                        <button
                          onClick={() => reject(x._id)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-neonPink hover:bg-white/10 transition disabled:opacity-60"
                          disabled={status !== "PENDING"}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => cancel(x._id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-neonPink hover:bg-white/10 transition disabled:opacity-60"
                        disabled={status !== "PENDING"}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
