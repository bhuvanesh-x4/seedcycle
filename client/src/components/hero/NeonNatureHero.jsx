import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "../ui/MagneticButton.jsx";
import ParallaxVines from "./ParallaxVines.jsx";
import { Link } from "react-router-dom";

export default function NeonNatureHero() {
  const { scrollY } = useScroll();

  const vinesY = useTransform(scrollY, [0, 700], [0, -70]);
  const blobsY = useTransform(scrollY, [0, 700], [0, -25]);
  const titleY = useTransform(scrollY, [0, 700], [0, -12]);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-midnight text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight2 to-black/90" />

      {/* organic blobs */}
      <motion.div style={{ y: blobsY }} className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-neonTeal/10 blur-2xl" />
      <motion.div style={{ y: blobsY }} className="absolute -right-32 top-10 h-[520px] w-[520px] rounded-full bg-neonPink/10 blur-2xl" />

      {/* vines */}
      <motion.div style={{ y: vinesY }} className="absolute inset-0 pointer-events-none">
        <ParallaxVines />
      </motion.div>

      {/* Top nav mimic (like reference image) */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-end gap-10 px-6 pt-10 text-neonTeal/90">
        {["Home", "About", "Contact", "Services"].map((t) => (
          <Link key={t} className="hover:text-neonPink transition-colors cursor-pointer" to={`/#${t.toLowerCase()}`}>
            {t}
          </Link>
        ))}
      </div>

      {/* Hero copy aligned to right like reference */}
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pt-16 md:grid-cols-2 md:pt-24">
        <div />

        <motion.div style={{ y: titleY }} className="flex flex-col items-start md:items-start">
          <h1 className="font-display text-6xl md:text-7xl font-extrabold leading-[0.95] neon-glow">
            <span className="text-neonPink">SeedCycle</span>
            <div className="mt-2 text-neonTeal text-4xl md:text-5xl font-light tracking-wide">
              Green Future Platform
            </div>
          </h1>

          <p className="mt-5 max-w-md text-neonTeal/80 text-sm leading-6">
            SeedCycle is a neon-nature ecosystem to list, discover, and exchange seeds & plants.
            Earn points, unlock badges, and grow your city greener — one swap at a time.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link to="/market">
              <MagneticButton className="px-7">
                <span className="flex items-center gap-2">
                  Explore <span className="text-neonPink">▾</span>
                </span>
              </MagneticButton>
            </Link>

             <Link to="/list">
              <MagneticButton className="px-7">
                <span className="flex items-center gap-2">
                  Create Listing <span className="text-neonPink">▾</span></span>
              </MagneticButton>
            </Link>

           
          </div>
        </motion.div>
      </div>
    </section>
  );
}
