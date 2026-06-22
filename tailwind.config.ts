import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tableau-inspired palette
        tab: {
          blue: "#1f77b4",
          orange: "#ff7f0e",
          green: "#2ca02c",
          red: "#d62728",
          teal: "#17becf",
          navy: "#0b3d61",
          ink: "#1a1a2e",
          slate: "#4a5568",
          panel: "#f4f6fb",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
