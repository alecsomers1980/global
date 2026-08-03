import type { DashboardData } from "@/lib/dashboard";
import AppHeader from "@/components/ui/AppHeader";
import StatCard from "./StatCard";
import BreakdownList from "./BreakdownList";
import AlertsPanel from "./AlertsPanel";
import CompTable from "./CompTable";

interface DepartmentDashboardProps {
  title: string;
  staffName: string;
  data: DashboardData;
}

export default function DepartmentDashboard({
  title,
  staffName,
  data,
}: DepartmentDashboardProps) {
  return (
    <div className="min-h-screen bg-mv-canvas">
      <AppHeader title={title} staffName={staffName} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-up space-y-8">
        {/* Stat cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total requests" value={data.totals.totalRequests} />
          <StatCard label="Pending" value={data.totals.pending} accent="navy" />
          <StatCard label="To issue" value={data.totals.toIssue} accent="blue" />
          <StatCard label="Issued" value={data.totals.issued} accent="mint" />
          <StatCard label="Declined" value={data.totals.declined} />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakdownList title="By performance" items={data.byPerformance} />
          <BreakdownList title="By requester" items={data.byRequester} />
        </div>

        {/* Alerts */}
        <AlertsPanel alerts={data.alerts} />

        {/* Requests table */}
        <CompTable rows={data.rows} caption="Requests" />
      </main>
    </div>
  );
}