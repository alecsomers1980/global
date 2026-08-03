import { requireStaff } from "@/lib/session";
import { getCompDashboard, getSalesSummary } from "@/lib/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import BreakdownList from "@/components/dashboard/BreakdownList";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import CompTable from "@/components/dashboard/CompTable";
import AppHeader from "@/components/ui/AppHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const staff = requireStaff(["Admin"]);
  const data = await getCompDashboard();
  const sales = await getSalesSummary();

  const { totals, houseSeats, byCategory, byPerformance, byRequester, alerts, rows } = data;

  return (
    <div className="min-h-screen bg-mv-canvas">
      <AppHeader title="Festival Leadership" staffName={staff.name} />

      {/* Stats row */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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