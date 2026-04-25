import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        card: "#141416",
        border: "#1F1F22",
        accent: {
          green: "#16C784",
          red: "#EA3943",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        flash: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.6" },
          "100%": { opacity: "1" },
        },
        "glow-green": {
          "0%": { boxShadow: "0 0 0 0 rgba(22,199,132,0)" },
          "50%": { boxShadow: "0 0 16px 2px rgba(22,199,132,0.25)" },
          "100%": { boxShadow: "0 0 0 0 rgba(22,199,132,0)" },
        },
        "glow-red": {
          "0%": { boxShadow: "0 0 0 0 rgba(234,57,67,0)" },
          "50%": { boxShadow: "0 0 16px 2px rgba(234,57,67,0.25)" },
          "100%": { boxShadow: "0 0 0 0 rgba(234,57,67,0)" },
        },
      },
      animation: {
        pulse: "pulse 2s ease-in-out infinite",
        flash: "flash 0.6s ease-in-out",
        "glow-green": "glow-green 1.2s ease-in-out",
        "glow-red": "glow-red 1.2s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
