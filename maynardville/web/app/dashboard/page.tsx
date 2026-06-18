import { getStaffSession } from "@/lib/session";
import { navGroupsForRole } from "@/lib/nav";
import AppHeader from "@/components/ui/AppHeader";
import DashboardCategories from "@/components/dashboard/DashboardCategories";
import Logo from "@/components/brand/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  const groups = navGroupsForRole(staff.role);

  return (
    <>
      <AppHeader title="Staff Hub" />
      <main className="min-h-screen bg-mv-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
          <DashboardCategories groups={groups} />
          <p className="text-center text-xs text-mv-navy/40 mt-10">
            Staff hub access is managed via email magic‑link sign‑in.
          </p>
        </div>
      </main>
    </>
  );
}