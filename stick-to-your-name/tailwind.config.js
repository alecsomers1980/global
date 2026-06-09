/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#E92C8B",
          purple: "#A3488C",
          teal: "#00B5E2",   // light blue
          orange: "#ED1C24", // red mapped to orange for class compatibility
          yellow: "#FEDD00",
          green: "#4BB648",
          blue: "#00A4E4",
        },
      },
      fontFamily: {
        display: ["system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
