===FILE: lib/nav.ts===
export interface NavEntry {
  title: string;
  href: string;
  roles: string[];
}

export const NAV_ITEMS: NavEntry[] = [
  { title: "Approvals", href: "/approvals", roles: ["Admin"] },
  { title: "Box Office", href: "/box-office", roles: ["Admin", "Box Office"] },
  { title: "Festival Leadership", href: "/leadership", roles: ["Admin"] },
  { title: "PR & Media", href: "/pr-media", roles: ["Admin", "PR & Media"] },
  { title: "Sponsorship", href: "/sponsorship", roles: ["Admin", "Sponsorships"] },
  { title: "Operations", href: "/operations", roles: ["Admin", "Operations"] },
  { title: "Sales vs Comp Report", href: "/reports", roles: ["Admin"] },
];

export function navForRole(role: string): NavEntry[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}
===END===

===FILE: components/ui/AppHeader.tsx===
import { getStaffSession } from "@/lib/session";
import { navForRole } from "@/lib/nav";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  staffName?: string;
}

export default async function AppHeader({
  title,
  subtitle,
  staffName,
}: AppHeaderProps) {
  const staff = getStaffSession();
  const name = staff?.name ?? staffName;
  const items = staff ? navForRole(staff.role) : [];

  return (
    <header className="sticky top-0 z-20 bg-mv-navy text-mv-cream shadow">
      {/* Row 1: Branding + user */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="h-6 w-px bg-mv-cream/20" />
          <div className="flex flex-col">
            <h1 className="font-heading text-lg font-semibold">{title}</h1>
            {subtitle && (
              <span className="text-xs text-mv-cream/70">{subtitle}</span>
            )}
          </div>
        </div>

        {name && (
          <div className="flex items-center">
            <span className="hidden sm:inline text-sm text-mv-cream/70 mr-3">
              Signed in as {name}
            </span>
            <Link
              href="/api/auth/logout"
              className="border border-mv-cream/30 rounded px-3 py-1 text-sm hover:bg-mv-cream hover:text-mv-navy transition-colors"
            >
              Sign out
            </Link>
          </div>
        )}
      </div>

      {/* Row 2: Navigation (only if signed in) */}
      {items.length > 0 && (
        <nav className="border-t border-mv-cream/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap rounded-t border-b-2 transition-colors ${
                title === "Staff Hub"
                  ? "border-mv-mint text-mv-cream font-semibold"
                  : "border-transparent text-mv-cream/70 hover:text-mv-cream"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm whitespace-nowrap rounded-t border-b-2 transition-colors ${
                  item.title === title
                    ? "border-mv-mint text-mv-cream font-semibold"
                    : "border-transparent text-mv-cream/70 hover:text-mv-cream"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Mint bottom strip */}
      <div className="h-0.5 w-full bg-mv-mint" />
    </header>
  );
}
===END===

===FILE: app/dashboard/page.tsx===
import { getStaffSession } from "@/lib/session";
import { NAV_ITEMS } from "@/lib/nav";
import AppHeader from "@/components/ui/AppHeader";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import {
  ClipboardCheck,
  Ticket,
  LayoutDashboard,
  Megaphone,
  Handshake,
  ClipboardList,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/approvals": ClipboardCheck,
  "/box-office": Ticket,
  "/leadership": LayoutDashboard,
  "/pr-media": Megaphone,
  "/sponsorship": Handshake,
  "/operations": ClipboardList,
  "/reports": BarChart3,
};

const descriptionMap: Record<string, string> = {
  "/approvals": "Review and approve pending requests across all departments.",
  "/box-office": "Sell tickets, manage sessions, and handle cash-ups.",
  "/leadership": "Festival-wide leadership tools and overview.",
  "/pr-media": "Coordinate press, media outreach, and publicity.",
  "/sponsorship": "Track sponsorship packages, deliverables, and contacts.",
  "/operations": "Oversee venue operations, logistics, and crew.",
  "/reports": "Sales versus comp performance reports and insights.",
};

export default async function DashboardPage() {
  const staff = getStaffSession();

  if (!staff) {
    return (
      <>
        <AppHeader title="Staff Hub" />
        <main className="min-h-screen flex flex-col items-center justify-center bg-mv-canvas px-4 text-center">
          <Logo href={null} className="h-12 w-auto mb-6" />
          <p className="text-mv-navy/70 text-sm mb-6 max-w-sm">
            You need to be signed in to access the staff hub. Use the magic‑link
            login page to continue.
          </p>
          <Link
            href="/staff-login"
            className="inline-flex items-center rounded px-6 py-2.5 bg-mv-mint text-mv-navy font-semibold text-sm hover:bg-mv-mint/90 transition-colors"
          >
            Sign in
          </Link>
        </main>
      </>
    );
  }

  const items = NAV_ITEMS.filter((i) => i.roles.includes(staff.role));

  return (
    <>
      <AppHeader title="Staff Hub" />
      <main className="min-h-screen bg-mv-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
            {items.map((item) => {
              const Icon = iconMap[item.href] ?? null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white border border-mv-line rounded shadow-card p-6 hover:shadow-lift hover:-translate-y-0.5 transition-all"
                >
                  {Icon && (
                    <div className="w-10 h-10 rounded bg-mv-mint/15 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-mv-mint" />
                    </div>
                  )}
                  <h3 className="font-heading text-mv-navy text-lg font-semibold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-mv-navy/70">
                    {descriptionMap[item.href] ?? ""}
                  </p>
                </Link>
              );
            })}
          </div>
          <p className="text-center text-xs text-mv-navy/40 mt-10">
            Staff hub access is managed via email magic‑link sign‑in.
          </p>
        </div>
      </main>
    </>
  );
}
===END===