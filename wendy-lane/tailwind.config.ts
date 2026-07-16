import type { Config } from "tailwindcss";

/**
 * Brand palette. `brand` green is sampled from the client's logo (intake/logo.png);
 * `leaf` is the lighter green from the Loggi reference; `timber` is the warm brown the
 * incumbent site uses for body text.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0E7C0F",
          50: "#F0F9F0",
          100: "#DCF0DC",
          200: "#B8E0B9",
          300: "#88CB8A",
          400: "#4FAE52",
          500: "#0E7C0F",
          600: "#0C6B0D",
          700: "#0A570B",
          800: "#084409",
          900: "#063607",
        },
        leaf: {
          DEFAULT: "#82B440",
          light: "#9BC663",
          dark: "#6F9A37",
        },
        timber: {
          DEFAULT: "#603913",
          light: "#8A5A2B",
          dark: "#3E2409",
        },
        cream: "#FCFCFC",
        ink: "#111111",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
