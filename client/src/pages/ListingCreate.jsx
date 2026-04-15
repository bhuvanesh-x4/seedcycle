import { useState } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import { api } from "../app/api.js";
import { useAuthStore } from "../app/store/authStore.js";
import { useNavigate, Link } from "react-router-dom";

export default function ListingCreate() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("seed");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);

  const [lng, setLng] = useState("75.1240");
  const [lat, setLat] = useState("15.3647");
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("type", type);
      fd.append("quantity", String(quantity));
      fd.append("description", description);
      fd.append("price", String(price));
fd.append("currency", "INR");

      fd.append("lng", lng);
      fd.append("lat", lat);
      if (photo) fd.append("photo", photo);

      await api.post("/seeds", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchMe();
      nav("/market");
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      {!user ? (
        <div className="text-white/70">
          You must login to create a listing. <Link className="text-neonPink underline" to="/auth">Login</Link>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <GlassCard>
            <h2 className="font-display text-3xl text-neonTeal">Create Seed Listing</h2>
            <p className="mt-2 text-white/70 text-sm">MVP uses Multer local uploads.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-3">
              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Title (e.g., Tomato Seeds)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="seed">Seed</option>
                  <option value="plant">Plant</option>
                  <option value="cutting">Cutting</option>
                </select>

                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <textarea
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                rows={4}
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
  type="number"
  min="0"
  placeholder="Price (INR)"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  required
/>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
                <input
                  className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>

              <input
                className="rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />

              {msg && <div className="text-sm text-neonPink">{msg}</div>}

              <button
                disabled={loading}
                className="mt-2 rounded-xl bg-neonPink px-5 py-3 font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Listing"}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}
