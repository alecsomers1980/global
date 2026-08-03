# Maynardville — Brand Guide
Extracted from https://maynardville.co.za (Firecrawl branding) on 2026-06-15.

## Logo assets (downloaded → `brand/logos/`)
| File | Source | Notes |
| --- | --- | --- |
| `maynardville-logo.png` | /wp-content/uploads/2024/05/Maynardville-Logo.png | Primary wordmark, 1514×327, RGBA transparent. **Cream (#FFFADB) — for DARK backgrounds only.** |
| `favicon-270.png` | /wp-content/uploads/2023/07/cropped-Maynardville-Favicon-270x270.png | 270×270 |
| `favicon-32.png` | /wp-content/uploads/2023/07/cropped-Maynardville-Favicon-32x32.png | 32×32 |

**Logo description:** Arched/banner wordmark "MAYNARDVILLE" with "OPEN-AIR FESTIVAL" beneath, flanked by small star/sparkle motifs. Single-colour cream.
⚠️ The only logo on the site is the cream version. A white admin UI will need a **dark (navy) variant** — recolour from the transparent PNG, or request the original vector (SVG/AI) from the client.

## Colour palette
The festival uses a deep-navy + royal-blue base with a mint accent and cream "ink". (Branding extraction returned slightly different `primary` per page because dark sections invert to cream — reconciled below.)

| Token | Hex | Role |
| --- | --- | --- |
| Navy (ink) | `#060A3C` | Primary text, dark section backgrounds, links |
| Royal Blue | `#0F3193` | Primary brand colour / buttons / highlights |
| Mint / Teal | `#62DAA9` | Secondary accent (CTAs, highlights) |
| Cream | `#FFFADB` | Logo colour + text/elements on dark backgrounds |
| Input Navy | `#3D4067` | Form input background (on dark) / muted navy |
| White | `#FFFFFF` | Page background |

Colour-scheme: **light** (white page bg, navy text), with **dark hero/section bands** (navy bg, cream text).

## Typography
- **Headings:** `Montserrat` (sans-serif)
- **Body:** `Helvetica, Arial` fallback → effective stack: `Montserrat, Helvetica, Arial, Lucida, sans-serif`
- Montserrat is a free Google Font — use `next/font/google`.
- Observed sizes: body 16px; H2 ~25px on content pages, large display H2 on hero. Treat as fluid/responsive, not fixed.

## Spacing & shape
- Base spacing unit: **4px**
- Border radius: **3px** (subtle, near-square — inputs and buttons)
- Input shadow: none

## Personality
Playful, high-energy on the home/marketing pages; more traditional/elegant on production pages. Target audience: festival-goers and cultural enthusiasts. For an **admin/back-end**, lean to the calmer navy/white side of the system with mint for primary actions.

## Source platform (for reference)
WordPress 6.9.4 + Divi 4.27.5 theme (custom, no formal component library).
