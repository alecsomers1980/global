import { requireStaff } from "@/lib/session";
import { getSalesVsComp } from "@/lib/reporting";
import ExportCsvButton from "@/components/reports/ExportCsvButton";
import AppHeader from "@/components/ui/AppHeader";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const staff = await requireStaff(["Admin"]);
  const report = await getSalesVsComp();

  return (
    <div className="min-h-screen bg-mv-canvas font-sans">
      <AppHeader title="Sales vs Comp Report" staffName={staff.name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Caption */}
        <p className="text-sm text-gray-600 mb-4 max-w-2xl">
          Sales figures accumulate from Quicket as purchases sync. Figures may be empty before go‑live.
        </p>

        <div className="mb-6">
          <ExportCsvButton rows={report.rows} filename="maynardville-sales-vs-comp.csv" />
        </div>

        {report.rows.length === 0 ? (
          <div className="bg-white rounded-[3px] border border-gray-200 p-8 text-center">
            <p className="text-gray-700 font-semibold">
              No performance data yet.
            </p>
            <p className="text-gray-600 mt-2">
              Performances populate from the Quicket sync, and sales accumulate as purchases come through.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[3px] border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-mv-navy-muted text-white font-heading">
                <tr>
                  <th className="text-left px-4 py-3">Performance</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Capacity</th>
                  <th className="text-right px-4 py-3">Tickets Sold</th>
                  <th className="text-right px-4 py-3">Gross</th>
                  <th className="text-right px-4 py-3">Comps Issued</th>
                  <th className="text-right px-4 py-3">Total Allocated</th>
                  <th className="text-right px-4 py-3">% of Capacity</th>
                  <th className="text-right px-4 py-3">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.performanceId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.performance}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-right">{row.capacity}</td>
                    <td className="px-4 py-3 text-right">{row.ticketsSold}</td>
                    <td className="px-4 py-3 text-right">
                      R{Math.round(row.gross).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">{row.compsIssued}</td>
                    <td className="px-4 py-3 text-right">{row.totalAllocated}</td>
                    <td className="px-4 py-3 text-right">
                      {row.utilisationPct === null
                        ? "—"
                        : `${row.utilisationPct}%`}
                      {row.utilisationPct !== null && row.utilisationPct >= 100 && (
                        <span className="text-red-600"> (full)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.remaining === null ? "—" : row.remaining}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-mv-navy text-white font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right">{report.totals.capacity}</td>
                  <td className="px-4 py-3 text-right">{report.totals.ticketsSold}</td>
                  <td className="px-4 py-3 text-right">
                    R{Math.round(report.totals.gross).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{report.totals.compsIssued}</td>
                  <td className="px-4 py-3 text-right">{report.totals.totalAllocated}</td>
                  <td className="px-4 py-3 text-right">
                    {report.totals.utilisationPct === null
                      ? "—"
                      : `${report.totals.utilisationPct}%`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {report.totals.remaining === null ? "—" : report.totals.remaining}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}