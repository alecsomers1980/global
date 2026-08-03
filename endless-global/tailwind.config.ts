import type { Config } from "tailwindcss";

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
          DEFAULT: "#102708", // deep forest green (primary)
          dark: "#0a1b05",
          mid: "#1c4310",
          light: "#2e5d1f",
        },
        cream: "#F5F5F5",
        section: "#F2F2F2",
        ink: "#1e1e1e",
        muted: "#686e77",
        line: "#E1E1E1",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1320px",
      },
      backgroundImage: {
        "pleated-green": "url('/images/home-2.png')",
      },
    },
  },
  plugins: [],
};

export default config;
