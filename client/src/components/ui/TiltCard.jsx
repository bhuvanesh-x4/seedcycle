import { useRef, useState } from "react";

export default function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: "perspective(900px) rotateX(0) rotateY(0)" });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;

    setStyle({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)` });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle({ transform: "perspective(900px) rotateX(0) rotateY(0)" })}
      style={style}
      className={
        "rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 transition-transform duration-150 will-change-transform " +
        className
      }
    >
      {children}
    </div>
  );
}
