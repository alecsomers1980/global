Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind. Add cross-dashboard navigation to the shared header. Brand: mv-navy #060A3C, mv-blue, mv-mint #62DAA9, mv-cream #FFFADB, mv-canvas, mv-line; Montserrat; rounded 3px. lucide-react available. ⚠️ All brand colour classes use the `mv-` prefix.

===FILE: lib/nav.ts===
A single source of truth for the staff navigation.
`export interface NavEntry { title: string; href: string; roles: string[]; }`
`export const NAV_ITEMS: NavEntry[] = [` these in order:
- { title: "Approvals", href: "/approvals", roles: ["Admin"] }
- { title: "Box Office", href: "/box-office", roles: ["Admin","Box Office"] }
- { title: "Festival Leadership", href: "/leadership", roles: ["Admin"] }
- { title: "PR & Media", href: "/pr-media", roles: ["Admin","PR & Media"] }
- { title: "Sponsorship", href: "/sponsorship", roles: ["Admin","Sponsorships"] }
- { title: "Operations", href: "/operations", roles: ["Admin","Operations"] }
- { title: "Sales vs Comp Report", href: "/reports", roles: ["Admin"] }
`]`
Also `export function navForRole(role: string): NavEntry[] { return NAV_ITEMS.filter(i => i.roles.includes(role)); }`

components/ui/AppHeader.tsx — REWRITE this existing server component. It currently renders a sticky mv-navy bar with the Logo, a title/subtitle, an optional "Signed in as {staffName}" + Sign out, and a mint bottom strip. KEEP that look. CHANGES:
- It should now SELF-FETCH the session: `import { getStaffSession } from "@/lib/session";` and `import { navForRole } from "@/lib/nav";` `import Logo from "@/components/brand/Logo"; import Link from "next/link";`
- Props stay `{ title: string; subtitle?: string; staffName?: string }` (staffName optional, used only as a fallback).
- `const staff = getStaffSession();` `const name = staff?.name ?? staffName;` `const items = staff ? navForRole(staff.role) : [];`
- Structure (sticky top-0 z-20, bg-mv-navy text-mv-cream, shadow): 
  ROW 1 (max-w-6xl mx-auto px-4 sm:px-6 py-3, flex items-center justify-between): LEFT = <Logo className="h-8 w-auto" /> (Logo links to /dashboard by default) + a thin cream/20 divider + the title (font-heading text-lg font-semibold) and optional subtitle (text-xs text-mv-cream/70). RIGHT = if name: "Signed in as {name}" (hidden sm:inline, text-sm text-mv-cream/70 mr-3) + a "Sign out" link to /api/auth/logout (border border-mv-cream/30 rounded px-3 py-1 text-sm hover:bg-mv-cream hover:text-mv-navy transition-colors).
  ROW 2 — the NAV (only render if items.length > 0): a bar (border-t border-mv-cream/10) with a max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto. First a "Dashboard" link to /dashboard (always shown when signed in) with a small lucide Home/LayoutGrid icon. Then each item in `items` as a Link to item.href. Each nav link: px-3 py-2 text-sm whitespace-nowrap rounded-t border-b-2 transition-colors. ACTIVE state = when item.title === title (the current page): `border-mv-mint text-mv-cream font-semibold`. INACTIVE: `border-transparent text-mv-cream/70 hover:text-mv-cream`. (The "Dashboard" link is active when title === "Staff Hub".)
- Keep the `<div className="h-0.5 w-full bg-mv-mint" />` mint strip at the very bottom.

components/ui/... only. ALSO update the hub:

app/dashboard/page.tsx — REWRITE to source nav from lib/nav (single source of truth) while keeping the current look. `import { getStaffSession } from "@/lib/session"; import Link from "next/link"; import AppHeader from "@/components/ui/AppHeader"; import Logo from "@/components/brand/Logo"; import { NAV_ITEMS } from "@/lib/nav";` and lucide icons { ClipboardCheck, Ticket, LayoutDashboard, Megaphone, Handshake, ClipboardList, BarChart3 }. Build an icon map keyed by href: "/approvals"→ClipboardCheck, "/box-office"→Ticket, "/leadership"→LayoutDashboard, "/pr-media"→Megaphone, "/sponsorship"→Handshake, "/operations"→ClipboardList, "/reports"→BarChart3. `export const dynamic = "force-dynamic";` `const staff = getStaffSession();` if null → the same branded mv-navy sign-in prompt (Logo href={null}, message, mint button link to /staff-login). Else: `<AppHeader title="Staff Hub" />` then `<main className="min-h-screen bg-mv-canvas">`... a max-w-6xl container with a grid (1/2/3 cols, gap-6, animate-fade-up) of cards built from `NAV_ITEMS.filter(i => i.roles.includes(staff.role))`. Each card = a next/link to item.href: bg-white border border-mv-line rounded shadow-card p-6 hover:shadow-lift hover:-translate-y-0.5 transition-all, with the mapped icon in a w-10 h-10 rounded bg-mv-mint/15 (icon text-mv-mint), the item.title (font-heading text-mv-navy), and a short one-line description (derive a sensible description per href). Footer note about email magic-link sign-in.

Output each file as its own ===FILE:===/===END=== block. No commentary.
