import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0057B8",
          dark: "#00408A",
          light: "#3B7FD1",
        },
        ink: "#0F172A",
        surface: "#F8FAFC",
        body: "#1F2937",
        gold: {
          DEFAULT: "#C79A2E",
          light: "#DDB65C",
        },
        border: "#E2E8F0",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Manrope", "sans-serif"],
      },
      maxWidth: {
        "8xl": "1440px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.9s ease-out forwards",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)",
        elevated: "0 4px 12px rgba(15, 23, 42, 0.06), 0 24px 48px -16px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
