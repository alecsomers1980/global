import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mv: {
          navy: "#060A3C",
          blue: "#0F3193",
          mint: "#62DAA9",
          cream: "#FFFADB",
          "navy-muted": "#3D4067",
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "Helvetica", "Arial", "sans-serif"],
        sans: ["var(--font-montserrat)", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};
export default config;