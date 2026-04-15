import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <div
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-midnight2/90 backdrop-blur-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="font-display text-lg text-neonTeal">{title}</div>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-5">{children}</div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
