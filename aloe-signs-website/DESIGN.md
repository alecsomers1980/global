# Design System: Aloe Signs (Cinematic UI)

## Brand Identity
- **Tone**: Professional, Premium, High-Impact, Artistic.
- **Visuals**: Modern Cinematic, Immersive Depth, Glassmorphism, Sophisticated Motion.

## Color Palette
### Cinematic Core (Dark Mode)
- **Cinematic Black**: `#0B0E0D` - *Main Backgrounds*
- **Deep Slate**: `#121816` - *Section Alternates*
- **Glass White**: `rgba(255, 255, 255, 0.05)` - *Card/Header Backgrounds with backdrop-blur-2xl*
- **Glass Border**: `rgba(255, 255, 255, 0.1)` - *Subtle borders*

### Brand Accents
- **Aloe Green**: `#3E7D6A` - *Primary Brand Color*
- **Vibrant Emerald**: `#4ADE80` - *Action/Highlight Color (WhatsApp, CTAs)*
- **Solar White**: `#F8FAFC` - *Typography Contrast*
- **Muted Sage**: `#94A3B8` - *Secondary Text*

## Typography
- **Headings**: **Outfit** (Sans-serif) - *Geometric, High-end, Cinematic*
- **Body**: **Manrope** - *Professional, Tech-forward, Legible*

## UI Components

### Floating Header
- **Style**: Floating pill or full-width glassmorphism.
- **Effect**: `backdrop-blur-2xl`, `bg-black/20`, `border-white/10`.
- **Navigation**: Simple, uppercase, tracked-wide.

### Cinematic Hero
- **Imagery**: Full-bleed background with a "vignette" or "dark-to-transparent" gradient overlay.
- **Content**: Center-aligned or split-screen with large `Outfit` typography.
- **CTA**: Primary button with a subtle "glow" or "shimmer" effect.

### Premium Cards (Service/Portfolio)
- **Radius**: `rounded-[2rem]` (32px).
- **Background**: Glassmorphism (`bg-white/5`) or Deep Slate.
- **Hover**: `-translate-y-3`, `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`, border color transition to `Aloe Green`.

### Section Transitions
- **Motion**: Subtle fade-in on scroll.
- **Depth**: Use of `z-index` and overlapping elements to create a layered feels.
