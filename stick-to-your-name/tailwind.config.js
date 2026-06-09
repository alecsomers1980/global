/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#E91E63",
          purple: "#7B1FA2",
          teal: "#26A69A",
          orange: "#FF9800",
          yellow: "#FDD835",
          green: "#7CB342",
        },
      },
      fontFamily: {
        display: ["system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
