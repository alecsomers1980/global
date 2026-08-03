===FILE: app/pr-media/page.tsx===
import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function PRMediaPage() {
  const staff = requireStaff(["PR & Media", "Admin"]);
  const data = await getCompDashboard(["Media", "VIP"]);

  return (
    <DepartmentDashboard
      title="PR & Media"
      staffName={staff.name}
      data={data}
    />
  );
}
===END===
===FILE: app/sponsorship/page.tsx===
import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function SponsorshipPage() {
  const staff = requireStaff(["Sponsorships", "Admin"]);
  const data = await getCompDashboard([
    "Partner / Sponsor",
    "Competition Winners",
  ]);

  return (
    <DepartmentDashboard
      title="Sponsorship"
      staffName={staff.name}
      data={data}
    />
  );
}
===END===
===FILE: app/operations/page.tsx===
import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const staff = requireStaff(["Operations", "Admin"]);
  const data = await getCompDashboard([
    "Competition Winners",
    "Cast / Crew / Team Comp",
    "VIP",
    "Media",
    "Partner / Sponsor",
  ]);

  return (
    <DepartmentDashboard
      title="Operations"
      staffName={staff.name}
      data={data}
    />
  );
}
===END===
===FILE: app/leadership/page.tsx===
import { requireStaff } from "@/lib/session";
import { getCompDashboard, getSalesSummary } from "@/lib/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import BreakdownList from "@/components/dashboard/BreakdownList";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import CompTable from "@/components/dashboard/CompTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const staff = requireStaff(["Admin"]);
  const data = await getCompDashboard();
  const sales = await getSalesSummary();

  const { totals, houseSeats, byCategory, byPerformance, byRequester, alerts, rows } = data;

  return (
    <div className="min-h-screen bg-mv-cream">
      {/* Branded header bar */}
      <header className="flex flex-wrap items-center justify-between bg-mv-navy px-6 py-4 text-mv-cream">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Movie Night Valley
          </h1>
          <p className="text-sm text-mv-cream/80">Festival Leadership</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Signed in as {staff.name}</span>
          <Link
            href="/api/auth/logout"
            className="rounded-[3px] border border-mv-cream/30 px-3 py-1 transition hover:bg-mv-cream hover:text-mv-navy"
          >
            Sign out
          </Link>
        </div>
      </header>

      {/* Stats row */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap gap-4">
          <StatCard label="Total requests" value={totals.totalRequests} />
          <StatCard label="Pending" value={totals.pending} accent="navy" />
          <StatCard label="To issue" value={totals.toIssue} accent="blue" />
          <StatCard label="Issued" value={totals.issued} accent="mint" />
          <StatCard label="Declined" value={totals.declined} />
          <StatCard
            label="House seats"
            value={houseSeats.count}
            hint={`${houseSeats.seats} seats`}
          />
        </div>
      </section>

      {/* Two-column grid of breakdowns */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BreakdownList title="By category" items={byCategory} />
          <BreakdownList title="By performance" items={byPerformance} />
          <BreakdownList title="By requester" items={byRequester} />
        </div>
      </section>

      {/* Alerts */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <AlertsPanel alerts={alerts} />
      </section>

      {/* Quicket sales card */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-[3px] border border-mv-navy/20 bg-white p-6 shadow-sm">
          <h2 className="font-heading mb-4 text-lg font-semibold text-mv-navy">
            Quicket sales
          </h2>
          {sales.length === 0 ? (
            <p className="text-sm text-mv-navy-muted">No Quicket sales synced yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mv-navy/10 text-mv-navy">
                    <th className="pb-2 font-medium">Performance</th>
                    <th className="pb-2 font-medium">Tickets</th>
                    <th className="pb-2 font-medium">Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.performance} className="border-b border-mv-navy/5 last:border-0">
                      <td className="py-2">{s.performance}</td>
                      <td className="py-2">{s.tickets}</td>
                      <td className="py-2">
                        R{Math.round(s.gross).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Comp table */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <CompTable rows={rows} caption="All complimentary requests" />
      </section>

      {/* Quick links */}
      <footer className="mx-auto max-w-7xl px-4 pb-8">
        <nav className="flex gap-4 text-sm">
          <Link href="/approvals" className="rounded-[3px] bg-mv-navy px-4 py-2 text-mv-cream transition hover:bg-mv-blue">
            Approvals
          </Link>
          <Link href="/box-office" className="rounded-[3px] bg-mv-blue px-4 py-2 text-mv-cream transition hover:bg-mv-navy">
            Box Office
          </Link>
        </nav>
      </footer>
    </div>
  );
}
===END===
===FILE: app/dashboard/page.tsx===
import { getStaffSession } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

const navItems = [
  {
    title: "Approvals",
    href: "/approvals",
    description: "Review and decide on complimentary requests.",
    roles: ["Admin"],
  },
  {
    title: "Box Office",
    href: "/box-office",
    description: "Manage issued comps, check-ins, and on‑the‑day operations.",
    roles: ["Admin", "Box Office"],
  },
  {
    title: "Festival Leadership",
    href: "/leadership",
    description: "Full festival dashboard with sales, alerts, and breakdowns.",
    roles: ["Admin"],
  },
  {
    title: "PR & Media",
    href: "/pr-media",
    description: "Manage media and VIP complimentary allocations.",
    roles: ["Admin", "PR & Media"],
  },
  {
    title: "Sponsorship",
    href: "/sponsorship",
    description: "Handle partner/sponsor and competition winner comps.",
    roles: ["Admin", "Sponsorships"],
  },
  {
    title: "Operations",
    href: "/operations",
    description: "Oversee all comp categories used by operations staff.",
    roles: ["Admin", "Operations"],
  },
];

export default async function DashboardHub() {
  const staff = getStaffSession();

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mv-cream px-4">
        <div className="w-full max-w-md rounded-[3px] bg-white p-8 shadow-lg text-center">
          <h1 className="font-heading text-2xl font-bold text-mv-navy mb-4">
            Movie Night Valley
          </h1>
          <p className="text-mv-navy-muted mb-6">
            Staff Dashboard — access restricted. Please sign in with your email
            magic link.
          </p>
          <Link
            href="/staff-login"
            className="inline-block rounded-[3px] bg-mv-navy px-6 py-2 text-mv-cream font-medium transition hover:bg-mv-blue"
          >
            Staff sign‑in
          </Link>
        </div>
      </div>
    );
  }

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(staff.role),
  );

  return (
    <div className="min-h-screen bg-mv-cream">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between bg-mv-navy px-6 py-4 text-mv-cream">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Movie Night Valley
          </h1>
          <p className="text-sm text-mv-cream/80">Staff Hub</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>
            Signed in as {staff.name} ({staff.role})
          </span>
          <Link
            href="/api/auth/logout"
            className="rounded-[3px] border border-mv-cream/30 px-3 py-1 transition hover:bg-mv-cream hover:text-mv-navy"
          >
            Sign out
          </Link>
        </div>
      </header>

      {/* Navigation grid */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allowedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[3px] border border-mv-navy/10 bg-white p-6 shadow-sm transition hover:border-mv-blue hover:shadow-md"
            >
              <h2 className="font-heading text-lg font-semibold text-mv-navy group-hover:text-mv-blue">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-mv-navy-muted">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer note */}
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-mv-navy-muted">
        Staff access is managed via email magic links. If you are unable to sign
        in, please contact the festival administrator.
      </footer>
    </div>
  );
}
===END===