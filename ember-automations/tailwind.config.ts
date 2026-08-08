import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: { 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 100: "#ffedd5", 50: "#fff7ed" },
        dark: { 900: "#0a0a0f", 800: "#13131a", 700: "#1c1c27", 600: "#252535", 500: "#2e2e42" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
