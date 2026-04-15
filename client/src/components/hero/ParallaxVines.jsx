export default function ParallaxVines() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
      {/* Blobby organic shapes */}
      <path d="M0,520 C160,430 260,470 360,620 C220,700 120,700 0,700 Z" fill="rgba(0,245,212,0.10)" />
      <path d="M0,0 C220,40 260,180 200,320 C120,520 0,540 0,540 Z" fill="rgba(255,0,127,0.08)" />
      <path d="M900,0 C1080,20 1200,160 1200,300 C1200,420 1120,480 1040,520 C980,410 920,300 900,0 Z" fill="rgba(255,159,28,0.08)" />

      {/* Vines */}
      <path
        d="M200,720 C220,560 200,420 260,320 C340,190 420,210 450,120"
        fill="none"
        stroke="rgba(255,0,127,0.55)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M280,720 C300,560 290,440 340,340 C420,180 520,260 560,140"
        fill="none"
        stroke="rgba(255,159,28,0.65)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M1000,720 C980,560 980,440 940,340 C880,180 780,220 740,120"
        fill="none"
        stroke="rgba(0,245,212,0.55)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Leaves */}
      {[
        { cx: 290, cy: 520, r: 18, f: "rgba(255,230,109,0.9)" },
        { cx: 320, cy: 470, r: 16, f: "rgba(255,159,28,0.95)" },
        { cx: 360, cy: 420, r: 14, f: "rgba(0,245,212,0.85)" },
        { cx: 400, cy: 360, r: 14, f: "rgba(255,0,127,0.85)" },
        { cx: 460, cy: 300, r: 13, f: "rgba(255,230,109,0.9)" },

        { cx: 890, cy: 520, r: 18, f: "rgba(255,0,127,0.9)" },
        { cx: 860, cy: 470, r: 16, f: "rgba(0,245,212,0.95)" },
        { cx: 820, cy: 420, r: 14, f: "rgba(255,230,109,0.85)" },
        { cx: 780, cy: 360, r: 14, f: "rgba(255,159,28,0.85)" },
        { cx: 740, cy: 300, r: 13, f: "rgba(255,0,127,0.9)" }
      ].map((l, i) => (
        <circle key={i} cx={l.cx} cy={l.cy} r={l.r} fill={l.f} />
      ))}
    </svg>
  );
}
