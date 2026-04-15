import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const finePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: fine)")?.matches ?? true;
  }, []);

  const [visible, setVisible] = useState(false);
  const [magRect, setMagRect] = useState(null); // {x,y,w,h}

  // Mouse position
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  // Dot follows cursor tightly
  const dotX = useSpring(mx, { stiffness: 900, damping: 60, mass: 0.2 });
  const dotY = useSpring(my, { stiffness: 900, damping: 60, mass: 0.2 });

  // Ring follows slower / smoother
  const ringX = useSpring(mx, { stiffness: 350, damping: 35, mass: 0.8 });
  const ringY = useSpring(my, { stiffness: 350, damping: 35, mass: 0.8 });

  const ringW = useSpring(42, { stiffness: 350, damping: 35, mass: 0.8 });
  const ringH = useSpring(42, { stiffness: 350, damping: 35, mass: 0.8 });
  const ringR = useSpring(999, { stiffness: 350, damping: 35, mass: 0.8 });

  useEffect(() => {
    if (!finePointer) return;

    const setFromMouse = (clientX, clientY) => {
      mx.set(clientX);
      my.set(clientY);
    };

    const onMove = (e) => {
      setVisible(true);
      setFromMouse(e.clientX, e.clientY);

      // If hovering a magnetic target, expand + lock ring to the element
      if (magRect) {
        const padX = 26;
        const padY = 18;
        const w = magRect.w + padX;
        const h = magRect.h + padY;

        ringW.set(w);
        ringH.set(h);
        ringR.set(18);

        const cx = magRect.x + magRect.w / 2;
        const cy = magRect.y + magRect.h / 2;

        // Place ring so it wraps the target
        ringX.set(cx - w / 2);
        ringY.set(cy - h / 2);
      } else {
        // Normal ring centered on cursor
        ringW.set(42);
        ringH.set(42);
        ringR.set(999);

        ringX.set(e.clientX - 21);
        ringY.set(e.clientY - 21);
      }
    };

    const onDown = () => {
      // click pulse
      ringW.set(34);
      ringH.set(34);
    };

    const onUp = () => {
      if (!magRect) {
        ringW.set(42);
        ringH.set(42);
      }
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    // Hover detection: Magnetic elements are marked with data-cursor="magnetic"
    const onPointerOver = (e) => {
      const target = e.target?.closest?.('[data-cursor="magnetic"]');
      if (target) {
        const r = target.getBoundingClientRect();
        setMagRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
    };

    const onPointerOut = (e) => {
      const target = e.target?.closest?.('[data-cursor="magnetic"]');
      if (target) setMagRect(null);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseleave", onLeave);
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
    };
  }, [finePointer, magRect, mx, my, ringH, ringR, ringW, ringX, ringY]);

  if (!finePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          width: ringW,
          height: ringH,
          borderRadius: ringR,
          opacity: visible ? 1 : 0
        }}
        className={[
          "absolute",
          "border border-white/20",
          "shadow-[0_0_22px_rgba(255,0,127,0.25)]",
          "backdrop-blur-[2px]",
          "bg-white/5"
        ].join(" ")}
      />

      {/* Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          opacity: visible ? 1 : 0
        }}
        className={[
          "absolute -translate-x-1/2 -translate-y-1/2",
          "h-2.5 w-2.5 rounded-full",
          "bg-neonTeal",
          "shadow-[0_0_18px_rgba(0,245,212,0.45)]"
        ].join(" ")}
      />
    </div>
  );
}
