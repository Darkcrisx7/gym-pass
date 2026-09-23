import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1A16",
        surface: "#16241F",
        surface2: "#1D2E27",
        paper: "#F3F0E6",
        gold: "#D8A945",
        goldSoft: "#E9C978",
        active: "#4C9A6A",
        expiring: "#D8912D",
        expired: "#C1443B",
        inactive: "#6B776F",
        muted: "#9FAEA6",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "0 20px 60px -25px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
