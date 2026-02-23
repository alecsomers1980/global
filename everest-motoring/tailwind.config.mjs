/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#d32f2f",      // Everest Red
        "primary-dark": "#b71c1c", // Darker Red for hover
        "secondary": "#1a237e",    // Everest Navy Blue
        "accent": "#F8F9FA",
        "neutral-light": "#dadfe7",
        "background-light": "#ffffff",
        "background-alt": "#F8F9FA",
        "background-dark": "#0f1723",
      },
      fontFamily: {
        "display": ["var(--font-space-grotesk)", "sans-serif"],
        "body": ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px -5px rgba(0, 102, 255, 0.1)',
      }
    },
  },
  plugins: [],
};
