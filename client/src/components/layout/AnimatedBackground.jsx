import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import bg from "../../assets/green-bg.jpg";

export default function AnimatedBackground({ routeKey }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // Subtle parallax drift on scroll
  const y = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -60]);
  const opacity = useTransform(scrollY, [0, 800], [0.69, 0.55]); // medium opacity + slight fade on scroll

  return (
    <motion.div
      key={routeKey}
      className="fixed inset-0 -z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background image layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          y,
          opacity,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "saturate(1.05) blur(0.2px)"
        }}
      />

      {/* Dark-green readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/65 to-midnight/80" />

      {/* Soft vignette */}
      <div className="absolute inset-0 [box-shadow:inset_0_0_180px_rgba(0,0,0,0.65)]" />
    </motion.div>
  );
}
