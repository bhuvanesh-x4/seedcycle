import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MagneticButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  };

  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      data-cursor="magnetic"

      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={
        "rounded-xl bg-neonPink px-6 py-3 font-display font-semibold text-midnight shadow-lg shadow-neonPink/30 " +
        "hover:shadow-neonPink/50 transition-shadow " + className
      }
      {...props}
    >
      {children}
    </motion.button>
  );
}
