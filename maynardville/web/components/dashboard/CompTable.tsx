import type { CompRequestRow } from "@/lib/types";
import StatusBadge from "../StatusBadge";

interface CompTableProps {
  rows: CompRequestRow[];
  caption?: string;
}

export default function CompTable({ rows, caption }: CompTableProps) {
  return (
    <div className="border border-mv-line rounded shadow-card overflow-hidden bg-white">
      {caption && (
        <div className="px-5 py-3 border-b border-mv-line font-heading text-sm text-mv-navy">
          {caption}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-6 text-sm text-mv-navy-muted">No requests.</div>
      ) : (
        <>
          {/* Mobile stacked cards */}
          <div className="sm:hidden divide-y divide-mv-line">
            {rows.map((row) => (
              <div key={row.id} className="p-4 space-y-2 text-sm">
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Guest</span>
                  <p className="text-mv-navy">{row.guestName} {row.guestSurname}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Performance</span>
                  <p className="text-mv-navy">{row.performance}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Category</span>
                  <p className="text-mv-navy">{row.category}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Requester</span>
                  <p className="text-mv-navy">{row.requester}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Seats</span>
                  <p className="text-mv-navy">{row.totalSeats}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={row.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-mv-canvas text-[11px] uppercase tracking-wide text-mv-navy-muted">
                  <th className="px-4 py-2.5 text-left font-medium">Guest</th>
                  <th className="px-4 py-2.5 text-left font-medium">Performance</th>
                  <th className="px-4 py-2.5 text-left font-medium">Category</th>
                  <th className="px-4 py-2.5 text-left font-medium">Requester</th>
                  <th className="px-4 py-2.5 text-right font-medium">Seats</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-mv-line hover:bg-mv-canvas/60 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm text-mv-navy">
                      {row.guestName} {row.guestSurname}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.performance}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.category}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.requester}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy text-right">
                      {row.totalSeats}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}