import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
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
          canvas: "#F4F4F1",
          line: "#E6E6E1",
        },
      },
      fontFamily: {
        heading: [
          "var(--font-montserrat)",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "var(--font-montserrat)",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(6,10,60,0.04), 0 6px 20px -10px rgba(6,10,60,0.14)",
        lift: "0 10px 34px -12px rgba(6,10,60,0.28)",
        focus: "0 0 0 3px rgba(15,49,147,0.35)",
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
      keyframes: {
        "fade-up": {
          from: {
            opacity: "0",
            transform: "translateY(6px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
} satisfies Config;

export default config;