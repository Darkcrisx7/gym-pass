import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App chrome — light theme
        bg: "#F6F7FB",
        surface: "#FFFFFF",
        border: "#E6E8F0",
        text: "#1A1D29",
        muted: "#6B7280",
        accent: "#2F6FED",
        accentSoft: "#EAF1FE",

        // The membership card face stays dark/navy regardless of app theme —
        // that contrast is what makes it read as a premium physical card.
        cardInk: "#121826",
        cardSurface: "#1B2436",
        cardText: "#F4F6FB",

        active: "#15A36A",
        activeSoft: "#E7F8F0",
        expiring: "#D98A16",
        expiringSoft: "#FDF2E2",
        expired: "#E0493A",
        expiredSoft: "#FCEAE8",
        inactive: "#8A93A6",
        inactiveSoft: "#EEF0F4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.10)",
        panel: "0 1px 2px rgba(16,24,40,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
