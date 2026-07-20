import typography from "@tailwindcss/typography";

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
        "primary": "#ffff01",      // Everest Yellow — backgrounds only (fails contrast as text on white)
        "primary-dark": "#e6e600", // Darker Yellow for hover
        "primary-ink": "#8a7a00",  // Readable yellow for text on light backgrounds
        "secondary": "#000000",    // Black
        "accent": "#ffffff",       // White
        "neutral-light": "#f3f4f6",
        "background-light": "#ffffff",
        "background-alt": "#fafafa",
        "background-dark": "#000000",
      },
      fontFamily: {
        "display": ["var(--font-microgramme)", "Arial", "sans-serif"],
        "body": ["var(--font-inter)", "system-ui", "sans-serif"],
        "sans": ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
      },
      zIndex: { '15': '15' },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
      }
    },
  },
  plugins: [typography],
};
