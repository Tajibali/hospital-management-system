import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        slate: {
          950: "#0B1220",
        },
        clinical: {
          50: "#EFF9F7",
          100: "#D8F0EA",
          200: "#B2E1D6",
          300: "#7FCBBB",
          400: "#4AAE9A",
          500: "#2C8F7C",
          600: "#1F7264",
          700: "#1A5B50",
          800: "#164940",
          900: "#123B34",
        },
        amber: {
          500: "#D9822B",
        },
        rose: {
          500: "#C4443C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
