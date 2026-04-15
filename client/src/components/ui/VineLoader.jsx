import { motion } from "framer-motion";

export default function VineLoader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <motion.svg width="140" height="60" viewBox="0 0 140 60" fill="none">
        <motion.path
          d="M10 50 C30 20, 60 20, 80 40 C95 55, 115 55, 130 30"
          stroke="rgba(0,245,212,0.8)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.circle
          cx="80"
          cy="40"
          r="6"
          fill="rgba(255,0,127,0.9)"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </motion.svg>
      <div className="text-neonTeal/80 text-sm">{label}</div>
    </div>
  );
}
