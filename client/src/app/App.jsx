import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { routes } from "./routes.jsx";
import { useAuthStore } from "./store/authStore.js";
import Navbar from "../components/layout/Navbar.jsx";
import AnimatedBackground from "../components/layout/AnimatedBackground.jsx";
import CustomCursor from "../components/ui/CustomCursor.jsx";

export default function App() {
  const location = useLocation();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="min-h-screen text-white">
      {/* ✅ Global animated background for ALL pages */}
      <CustomCursor />

      <AnimatePresence mode="wait">
        <AnimatedBackground routeKey={location.pathname} />
      </AnimatePresence>

      <Navbar />

      {/* ✅ Smooth page transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10"
        >
          <Routes location={location} key={location.pathname}>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
