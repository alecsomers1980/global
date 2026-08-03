Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind. Refine the design system for an elegant, premium internal admin for the MAYNARDVILLE OPEN-AIR FESTIVAL (theatre). Restrained, modern, high-trust — NOT flashy. Avoid AI clichés: no mesh/aurora gradients, no glassmorphism-everywhere, no neon. Keep depth via SOFT layered shadows and a tinted canvas so white cards lift. Brand: navy #060A3C, royal blue #0F3193, mint #62DAA9 (the single action accent), cream #FFFADB, navy-muted #3D4067, Montserrat (CSS var --font-montserrat already set on <html> by layout). The logo is a CREAM wordmark at /public/maynardville-logo.png (1514×327) — only legible on dark/navy backgrounds.

BUILD these files (full contents):

===FILE: tailwind.config.ts===
TypeScript Tailwind config. content globs: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"]. theme.extend:
- colors.mv = { navy:"#060A3C", blue:"#0F3193", mint:"#62DAA9", cream:"#FFFADB", "navy-muted":"#3D4067", canvas:"#F4F4F1", line:"#E6E6E1" }
- fontFamily: { heading:["var(--font-montserrat)","Helvetica","Arial","sans-serif"], sans:["var(--font-montserrat)","Helvetica","Arial","sans-serif"] }
- borderRadius: { DEFAULT:"3px", md:"4px", lg:"6px" }
- boxShadow: { card:"0 1px 2px rgba(6,10,60,0.04), 0 6px 20px -10px rgba(6,10,60,0.14)", lift:"0 10px 34px -12px rgba(6,10,60,0.28)", focus:"0 0 0 3px rgba(15,49,147,0.35)" }
- letterSpacing: { tightish:"-0.01em" }
- keyframes: { "fade-up": { from:{opacity:"0",transform:"translateY(6px)"}, to:{opacity:"1",transform:"translateY(0)"} } }
- animation: { "fade-up":"fade-up 0.4s ease-out both" }
export default the config (typed `import type { Config } from "tailwindcss"`).

app/globals.css — @tailwind base/components/utilities. In @layer base: set :root brand CSS vars; `body { @apply bg-mv-canvas text-mv-navy font-sans antialiased; }`; headings use font-heading + tracking-tightish + font semibold; `a { @apply transition-colors; }`; focus-visible: `:focus-visible { outline: none; @apply ring-2 ring-mv-blue/50 ring-offset-1; }` (or box-shadow focus). `::selection { background:#62DAA9; color:#060A3C; }`. A subtle custom scrollbar (thin, navy-muted thumb on transparent track) via ::-webkit-scrollbar. A `@media (prefers-reduced-motion: reduce)` block that disables animations/transitions. Keep it clean and not heavy.

components/brand/Logo.tsx — server component using `import Image from "next/image"` and `import Link from "next/link"`. Props { className?: string; href?: string | null }. Renders `<Image src="/maynardville-logo.png" width={1514} height={327} alt="Maynardville Open-Air Festival" priority className={className ?? "h-9 w-auto"} />`. If href is undefined default it to "/dashboard"; if href is null render the image bare; otherwise wrap in `<Link href={href}>`. (The cream logo must sit on a dark background — callers ensure that.)

components/ui/AppHeader.tsx — server component. `import Logo from "@/components/brand/Logo"; import Link from "next/link";` Props { title: string; subtitle?: string; staffName?: string }. Render a STICKY header (`sticky top-0 z-20`) with bg-mv-navy text-mv-cream, shadow, and a 2px mint bottom strip. Layout: a max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 row — LEFT: <Logo className="h-8 w-auto" /> then a vertical divider (a thin cream/20 line) then a block with the {title} (font-heading text-lg font-semibold) and optional {subtitle} (text-xs text-mv-cream/70). RIGHT: if staffName given, show "Signed in as {staffName}" (text-sm, hidden on very small screens) and a "Sign out" link to /api/auth/logout styled as a small bordered button (border border-mv-cream/30 rounded px-3 py-1 text-sm hover:bg-mv-cream hover:text-mv-navy transition-colors). Below the nav row render `<div className="h-0.5 w-full bg-mv-mint" />`. Mobile: wrap gracefully.

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
