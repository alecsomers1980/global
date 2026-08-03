import type { CompRequestRow } from "@/lib/types";
import { CheckCircle } from "lucide-react";

interface AlertsPanelProps {
  alerts: CompRequestRow[];
}

function missingMessage(row: CompRequestRow) {
  const missing: string[] = [];
  if (!row.seatNumbers || row.seatNumbers.length === 0) missing.push("seat numbers");
  if (!row.ticketReference) missing.push("ticket reference");
  if (missing.length === 0) return null;
  return `Missing ${missing.join(" & ")}`;
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="border-l-4 border-amber-400 rounded shadow-card p-5 bg-white">
      <h3 className="font-heading text-mv-navy text-lg mb-3">Action needed</h3>

      {alerts.length === 0 ? (
        <div className="flex items-center text-mv-navy">
          <CheckCircle className="w-4 h-4 text-mv-mint mr-1.5" />
          <span>All good — no outstanding issues.</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((row) => {
            const msg = missingMessage(row);
            return (
              <li key={row.id} className="flex flex-wrap items-baseline py-1 border-b border-mv-line last:border-0">
                <span className="font-semibold text-mv-navy">
                  {row.guestName} {row.guestSurname}
                </span>
                <span className="text-mv-navy-muted ml-1">— {row.performance}</span>
                {msg && <span className="text-amber-600 text-xs ml-2">{msg}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}