/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // L'Éloge — a ceremonial letterpress. Warm paper, deep bottle-green ink, aged brass.
        paper: {
          DEFAULT: "#f6f0e2",
          light: "#fcf8ee",
          dim: "#ece3cf",
          shade: "#ddd0b4",
        },
        bottle: {
          DEFAULT: "#14342b",
          deep: "#0d231d",
          mid: "#1f4a3d",
          soft: "#2e6453",
        },
        ink: {
          DEFAULT: "#1a241f",
          soft: "#3c4b43",
          faint: "#6b7a70",
        },
        brass: {
          DEFAULT: "#b88a2e",
          light: "#d4a743",
          deep: "#8c6418",
          pale: "#e7cf95",
        },
        oxblood: "#6e261f",
        rose: "#a14d52",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        leaf: "0 1px 2px rgba(13,35,29,0.06), 0 8px 28px rgba(13,35,29,0.10)",
        "leaf-lg": "0 2px 4px rgba(13,35,29,0.08), 0 18px 50px rgba(13,35,29,0.16)",
        seal: "0 2px 0 0 rgba(140,100,24,0.45)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        sealIn: {
          "0%": { opacity: "0", transform: "scale(0.86) rotate(-6deg)" },
          "60%": { transform: "scale(1.04) rotate(1deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s cubic-bezier(0.2,0.7,0.2,1) both",
        fadeIn: "fadeIn 0.5s ease-out both",
        pulseSoft: "pulseSoft 1.2s ease-in-out infinite",
        sealIn: "sealIn 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
      },
    },
  },
  plugins: [],
};
