/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // 🌿 Dark green base theme (replaces dark blue)
        midnight: "#071A12",      // main background (very dark green)
        midnight2: "#0A2318",     // gradient / section background
        midnight3: "#0E2D1F",     // cards / surfaces

        neonPink: "#FF007F",
        neonTeal: "#00F5D4",
        sunsetOrange: "#FF9F1C",
        brightYellow: "#FFE66D"
      }
    }
  },
  plugins: []
};
