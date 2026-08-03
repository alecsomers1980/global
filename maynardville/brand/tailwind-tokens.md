# Tailwind / Next.js setup snippet

## tailwind.config.ts (extend)
```ts
export default {
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
};
```

## Font (app/layout.tsx)
```ts
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// <html className={montserrat.variable}>
```

## Usage notes for the admin/back-end
- Default surface: white bg, `mv-navy` text — matches the site's light pages.
- Primary action buttons: `mv-blue` (or `mv-mint` for a brighter CTA), with `3px` radius.
- Dark bands / sidebar / login screen can use `mv-navy` bg with `mv-cream` text + the cream logo.
- The supplied logo is cream-only → use on dark surfaces. Generate/recolour a navy logo for white surfaces, or get the vector from the client.
```
```
