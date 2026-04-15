import { motion } from "framer-motion";
import { page, pageTransition } from "../../app/motion/pageTransitions.js";

export default function PageShell({ children }) {
  return (
    <motion.main
      initial={page.initial}
      animate={page.animate}
      exit={page.exit}
      transition={pageTransition}
      className="relative z-10"
    >
      {children}
    </motion.main>
  );
}
