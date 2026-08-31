"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { listStockists, setStockistStatus, type AdminStockist } from "../actions";
import {
  BTN_QUIET,
  Card,
  EmptyState,
  FilterChips,
  Notice,
  PageHeader,
  StatusPill,
} from "@/components/admin/ui";

const FILTERS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
];

const TH =
  "border-b border-hairline px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink-mute";
const TD = "border-b border-hairline px-4 py-4 align-top text-ink";

export default function AdminStockistsPage() {
  const token = useAdminToken();
  const [rows, setRows] = useState<AdminStockist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("new");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await listStockists(token, filter === "all" ? undefined : filter);
      if (cancelled) return;
      if (result.ok) setRows(result.data);
      else setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, filter]);

  async function change(id: string, status: "new" | "contacted" | "approved" | "declined") {
    if (!token || busyId) return;
    setBusyId(id);
    setError(null);
    const result = await setStockistStatus(token, id, status);
    if (result.ok) {
      const reload = await listStockists(token, filter === "all" ? undefined : filter);
      if (reload.ok) setRows(reload.data);
      else setError(reload.error);
    } else {
      setError(result.error);
    }
    setBusyId(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Enquiries"
        title="Stockist applications"
        description="Shops asking to carry the range. Marking one approved is a note to yourself — it does not send anything or open a trade account."
      />

      <div className="mt-8">
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : rows.length === 0 ? (
        <Card className="mt-6">
          <EmptyState message="No applications here yet." />
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <thead>
              <tr>
                <th className={TH}>Business</th>
                <th className={TH}>Contact</th>
                <th className={TH}>Town</th>
                <th className={TH}>Received</th>
                <th className={TH}>Status</th>
                <th className={TH} />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className={TD}>
                    {s.business}
                    {s.stocking && (
                      <div className="mt-1 text-[13px] text-ink-mute">Currently stocks: {s.stocking}</div>
                    )}
                  </td>
                  <td className={TD}>
                    {s.contact}
                    <div className="text-[13px] text-ink-mute">{s.email}</div>
                    <div className="text-[13px] text-ink-mute">{s.phone}</div>
                  </td>
                  <td className={TD}>{s.town}</td>
                  <td className={TD}>
                    {new Date(s.created_at).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className={TD}>
                    <StatusPill status={s.status} />
                  </td>
                  <td className={TD}>
                    <div className="flex flex-wrap gap-2">
                      {s.status !== "contacted" && (
                        <button type="button" onClick={() => change(s.id, "contacted")} disabled={busyId === s.id} className={BTN_QUIET}>
                          Contacted
                        </button>
                      )}
                      {s.status !== "approved" && (
                        <button type="button" onClick={() => change(s.id, "approved")} disabled={busyId === s.id} className={BTN_QUIET}>
                          Approve
                        </button>
                      )}
                      {s.status !== "declined" && (
                        <button type="button" onClick={() => change(s.id, "declined")} disabled={busyId === s.id} className={BTN_QUIET}>
                          Decline
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
