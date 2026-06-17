import Link from "next/link";
import { getStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const staff = getStaffSession();

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-heading font-bold">Maynardville</h1>
          <p className="text-lg text-[#FFFADB]/70">
            Staff Comp‑Ticket Portal
          </p>
          <Link
            href="/staff-login"
            className="inline-block rounded-[3px] bg-[#0F3193] hover:bg-[#0F3193]/90 text-white font-medium px-6 py-3 transition-colors"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB]">
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0F3193]/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <p className="text-sm text-[#FFFADB]/70">Staff Dashboard</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#62DAA9]">
            Signed in as {staff.name} ({staff.role})
          </span>
          <Link
            href="/api/auth/logout"
            className="underline underline-offset-2 hover:text-[#62DAA9] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.role === "Admin" && (
            <Link
              href="/approvals"
              className="group rounded-[3px] border border-[#3D4067] bg-[#060A3C] hover:border-[#0F3193] hover:bg-[#0F3193]/10 p-6 transition-all"
            >
              <h2 className="text-xl font-heading font-semibold group-hover:text-[#62DAA9]">
                Approvals
              </h2>
              <p className="text-sm text-[#FFFADB]/60 mt-2">
                Review and approve comp requests
              </p>
            </Link>
          )}

          {(staff.role === "Box Office" || staff.role === "Admin") && (
            <Link
              href="/box-office"
              className="group rounded-[3px] border border-[#3D4067] bg-[#060A3C] hover:border-[#0F3193] hover:bg-[#0F3193]/10 p-6 transition-all"
            >
              <h2 className="text-xl font-heading font-semibold group-hover:text-[#62DAA9]">
                Box Office
              </h2>
              <p className="text-sm text-[#FFFADB]/60 mt-2">
                Issue tickets and view comps
              </p>
            </Link>
          )}

          {["PR/Media", "Sponsorship", "Operations", "Leadership"].map(
            (label) => (
              <div
                key={label}
                className="rounded-[3px] border border-[#3D4067] bg-[#060A3C] opacity-60 p-6"
              >
                <h2 className="text-xl font-heading font-semibold text-[#FFFADB]/50">
                  {label}
                </h2>
                <p className="text-sm text-[#FFFADB]/30 mt-2">Coming soon</p>
              </div>
            )
          )}
        </div>

        {/* TODO: Replace staff auth with Auth.js when ready */}
      </main>
    </div>
  );
}