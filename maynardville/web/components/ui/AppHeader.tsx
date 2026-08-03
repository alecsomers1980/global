import { getStaffSession } from "@/lib/session";
import { navGroupsForRole } from "@/lib/nav";
import NavGroupMenu from "@/components/ui/NavGroupMenu";
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
  const groups = staff ? navGroupsForRole(staff.role) : [];

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
            {/* Plain <a>, not <Link>: this is a destructive GET that clears the
                session cookie. A Next.js <Link> would prefetch it and log the
                user out in the background. */}
            <a
              href="/api/auth/logout"
              className="border border-mv-cream/30 rounded px-3 py-1 text-sm hover:bg-mv-cream hover:text-mv-navy transition-colors"
            >
              Sign out
            </a>
          </div>
        )}
      </div>

      {/* Row 2: Navigation (only if signed in) */}
      {groups.length > 0 && (
        <nav className="border-t border-mv-cream/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-1">
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
            <NavGroupMenu groups={groups} activeTitle={title} />
          </div>
        </nav>
      )}

      {/* Mint bottom strip */}
      <div className="h-0.5 w-full bg-mv-mint" />
    </header>
  );
}