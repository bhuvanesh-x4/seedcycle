import { useEffect } from "react";
import PageShell from "../components/layout/PageShell.jsx";
import NeonNatureHero from "../components/hero/NeonNatureHero.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { Link, useLocation } from "react-router-dom";
import { Leaf, MapPin, Recycle, Sparkles, Phone, Mail } from "lucide-react";

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl text-neonTeal">{title}</h2>
            {subtitle && <p className="mt-2 text-white/70 max-w-2xl">{subtitle}</p>}
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const { hash } = useLocation();

  // Smooth scroll when clicking nav anchors
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <PageShell>
      {/* HERO */}
      <section id="home" className="scroll-mt-24">
        <NeonNatureHero />
      </section>

      {/* ABOUT */}
      <Section
        id="about"
        title="About SeedCycle"
        subtitle="A neon-nature ecosystem that makes urban gardening social, local, and rewarding."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard>
            <div className="flex items-center gap-3">
              <Leaf className="text-neonTeal" />
              <div className="font-display text-lg text-neonTeal">Mission</div>
            </div>
            <p className="mt-3 text-white/70">
              Reduce waste, revive biodiversity, and help people grow food at home by making seeds easy to share.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3">
              <Recycle className="text-neonPink" />
              <div className="font-display text-lg text-neonTeal">How it works</div>
            </div>
            <p className="mt-3 text-white/70">
              List your seeds/plants → discover nearby listings → request to buy or exchange → meet & grow.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3">
              <Sparkles className="text-brightYellow" />
              <div className="font-display text-lg text-neonTeal">Gamification</div>
            </div>
            <p className="mt-3 text-white/70">
              Earn points for listings, successful swaps, and community tips. Unlock badges like “Top Contributor”.
            </p>
          </GlassCard>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/market">
            <MagneticButton>Explore Marketplace</MagneticButton>
          </Link>
          <Link to="/create">
            <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-neonTeal/90 hover:bg-white/10 transition">
              Create a Listing
            </button>
          </Link>
        </div>
      </Section>

      {/* SERVICES */}
      <Section
        id="services"
        title="Services"
        subtitle="Everything you need to discover, trade, and learn — all in one place."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <div className="flex items-center gap-3">
              <MapPin className="text-neonTeal" />
              <div className="font-display text-xl text-neonTeal">Nearby Discovery</div>
            </div>
            <p className="mt-3 text-white/70">
              Explore seed/plant listings on a map and find options close to you for quick pick-ups.
            </p>
            <div className="mt-5">
              <Link to="/market">
                <MagneticButton className="mt-5">Open Map</MagneticButton>
              </Link>

            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3">
              <Recycle className="text-neonPink" />
              <div className="font-display text-xl text-neonTeal">Buy & Exchange Flow</div>
            </div>
            <p className="mt-3 text-white/70">
              Request to buy a listing or exchange with one of your own listings. Sellers can approve/reject.
            </p>
            <div className="mt-5">
              <Link to="/exchanges">
                <MagneticButton className="mt-5">View Exchanges</MagneticButton>
              </Link>

            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3">
              <Sparkles className="text-brightYellow" />
              <div className="font-display text-xl text-neonTeal">Community Feed</div>
            </div>
            <p className="mt-3 text-white/70">
              Share quick tips, compost hacks, and watering schedules. Learn from your local gardeners.
            </p>
            <div className="mt-5">
              <Link to="/feed">
                <MagneticButton className="mt-5">Open Feed</MagneticButton>
              </Link>

            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3">
              <Leaf className="text-neonTeal" />
              <div className="font-display text-xl text-neonTeal">Profiles & Badges</div>
            </div>
            <p className="mt-3 text-white/70">
              Track your points, listings, and swaps. Build trust and reputation in your neighborhood.
            </p>
            <div className="mt-5">
              <Link to="/dashboard">
                <MagneticButton className="mt-5">Go to Dashboard</MagneticButton>
              </Link>

            </div>
          </GlassCard>
        </div>
      </Section>

      {/* CONTACT */}
      <Section
        id="contact"
        title="Contact"
        subtitle="Have feedback or want to collaborate? Reach out."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <div className="font-display text-xl text-neonTeal">Get in touch</div>

            <div className="mt-4 space-y-3 text-white/70">
              <a
                href="mailto:useful200414@gmail.com"
                className="flex items-center gap-3 hover:text-neonPink transition"
              >
                <Mail className="text-neonPink" size={18} />
                <span>useful200414@gmail.com</span>
              </a>
              <a
                href="tel:+15550111958"
                className="flex items-center gap-3 hover:text-neonTeal transition"
              >
                <Phone className="text-neonTeal" size={18} />
                <span>1 (555) 011-1958</span>
              </a>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-neonTeal/10 border border-neonTeal/20">
              <p className="text-neonTeal text-sm font-medium">💬 Quick Response</p>
              <p className="text-white/60 text-xs mt-1">
                We typically respond within 24 hours. For urgent matters, call us directly.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="font-display text-xl text-neonTeal">Send a message</div>

            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = formData.get("name");
                const email = formData.get("email");
                const message = formData.get("message");

                // Create mailto link with message details
                const subject = encodeURIComponent(`SeedCycle Contact from ${name}`);
                const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

                window.location.href = `mailto:useful200414@gmail.com?subject=${subject}&body=${body}`;
                form.reset();
              }}
            >
              <input
                name="name"
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Your name"
                required
              />
              <input
                name="email"
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Your email"
                type="email"
                required
              />
              <textarea
                name="message"
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-neonTeal/60"
                placeholder="Message"
                rows={4}
                required
              />
              <MagneticButton className="w-full justify-center">Send Message</MagneticButton>
            </form>
          </GlassCard>
        </div>
      </Section>
    </PageShell>
  );
}
