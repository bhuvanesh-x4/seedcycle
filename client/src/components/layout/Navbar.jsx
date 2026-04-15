import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, MapPin, Sparkles, Users, CloudRain, BarChart } from "lucide-react";
import { useAuthStore } from "../../app/store/authStore.js";

const navLink =
  "text-neonTeal/90 hover:text-neonPink transition-colors px-3 py-2 rounded-lg";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link to="/#home" className="flex items-center gap-2 font-display text-lg">
          <Leaf className="text-neonTeal" />
          <span className="text-neonTeal">Seed</span>
          <span className="text-neonPink neon-glow">Cycle</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Landing sections */}
          <Link to="/#home" className={navLink}>Home</Link>
          <Link to="/#about" className={navLink}>About</Link>
          <Link to="/#services" className={navLink}>Services</Link>
          <Link to="/#contact" className={navLink}>Contact</Link>

          {/* App routes */}
          <NavLink to="/market" className={navLink}>
            <span className="inline-flex items-center gap-2">
              <MapPin size={18} /> Marketplace
            </span>
          </NavLink>
          <NavLink to="/feed" className={navLink}>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={18} /> Feed
            </span>
          </NavLink>
          <NavLink to="/exchanges" className={navLink}>
            <span className="inline-flex items-center gap-2">
              <Users size={18} /> Exchanges
            </span>
          </NavLink>
          <NavLink to="/weather" className={navLink}>
            <span className="inline-flex items-center gap-2">
              <CloudRain size={18} /> Planting Guide
            </span>
          </NavLink>
          <NavLink to="/analytics" className={navLink}>
            <span className="inline-flex items-center gap-2">
              <BarChart size={18} /> Analytics
            </span>
          </NavLink>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm border border-white/10 hover:bg-white/15 transition"
              >
                {user.name} · {user.points} pts
              </Link>
              <button
                onClick={onLogout}
                className="rounded-xl bg-neonPink px-4 py-2 text-sm font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl bg-neonPink px-4 py-2 text-sm font-display text-midnight hover:shadow-lg hover:shadow-neonPink/30 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
