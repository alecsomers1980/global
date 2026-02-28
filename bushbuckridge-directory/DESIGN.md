# Design System: Bushbuckridge Directory (Cinematic UI)

## 1. Visual Theme & Atmosphere
- **Vibe**: Immersive, Premium, Vibrant, and Story-driven.
- **Atmosphere**: A "Living Directory" that feels like a premium digital magazine or a cinematic portal into the local economy. 
- **Style**: High-contrast, deep shadows, smooth motion, and "physical" depth. Use of glassmorphism and large background imagery.

## 2. Color Palette & Roles
- **Savannah Deep Green (#1B4332)**: Primary brand color, representing growth and the local landscape. Used for headers and primary backgrounds.
- **Solar Gold (#FFD700)**: Accent color for "Spotlight", "Featured", and "Opportunities". Represents prosperity and excellence.
- **Earth Slate (#2D3436)**: Neutral dark for text and deep shadows.
- **Pure White (#FFFFFF)**: Main text on dark backgrounds and clean surfaces.
- **Glass/Translucent (rgba(255, 255, 255, 0.05))**: For cinematic overlays and cards.

## 3. Typography Rules
- **Headings**: **Outfit** or **Inter** (Bold/Extra Bold) - *Modern, geometric, impactful.*
- **Body**: **Inter** (Regular/Medium) - *Maximum legibility, clean.*
- **Data/Badges**: **JetBrains Mono** or similar monospace - *For a technical, "directory" feel.*

## 4. Component Stylings
* **Buttons**:
    - **Primary**: "Savannah Green" with a subtle inner glow. Rounded-full (Pill-shaped).
    - **Cinematic**: Transparent with a white border and a shimmer effect on hover.
* **Cards**:
    - **Premium Card**: Deep background with a 1px border (`border-white/10`). 
    - **Elevation**: "Whisper-soft" diffused shadows that expand on hover.
    - **Interactive**: 1.02x scale up on hover with a slight brightness boost.
* **Navigation**:
    - **Floating Header**: Glassmorphism effect (`backdrop-blur-md`) with a thin bottom border.

## 5. Layout Principles
- **Whitespace**: "Cinematic" margins (generous padding to let elements breathe).
- **Hierarchy**: Use of "Motion Hierarchy" — elements fade in as the user scrolls.
- **Imagery**: Full-bleed hero images with dark overlays to make text "pop".

## 6. Design System Notes for Stitch Generation
When generating screens, use:
- `bg-[#1B4332]` for primary sections.
- `text-[#FFD700]` for highlights.
- `backdrop-blur-xl` for overlays.
- `rounded-3xl` for large containers to give a modern, friendly feel.
- `shadow-[0_20px_50px_rgba(0,0,0,0.3)]` for deep cinematic depth.
