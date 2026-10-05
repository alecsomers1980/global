"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import {
  generateReport,
  listReports,
  reportDownloadUrl,
  sendReport,
  type AdminReport,
} from "../actions";
import {
  BTN_PRIMARY,
  BTN_QUIET,
  CARD,
  Card,
  EmptyState,
  FIELD,
  FIELD_LABEL,
  Notice,
  PageHeader,
} from "@/components/admin/ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const label = (key: string) => `${MONTHS[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`;

/** Last month, in Johannesburg — the newest month that can be reported. */
function lastMonthKey(): string {
  const sast = new Date(Date.now() + 2 * 3_600_000);
  const d = new Date(Date.UTC(sast.getUTCFullYear(), sast.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function AdminReportsPage() {
  const token = useAdminToken();
  const [rows, setRows] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [month, setMonth] = useState(lastMonthKey);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    const result = await listReports(token);
    if (result.ok) setRows(result.data);
    else setError(result.error);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function run(key: string, work: () => Promise<string | null>) {
    if (!token || busy) return;
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      const message = await work();
      if (message) setNotice(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(null);
  }

  const generate = () =>
    run(`generate`, async () => {
      const result = await generateReport(token, month);
      if (!result.ok) throw new Error(result.error);
      await reload();
      return `${label(month)} is ready${result.data.gaAvailable ? "" : " — website traffic was unavailable, so that section is blank"}. It has not been emailed; use Send when you are happy with it.`;
    });

  const download = (m: string) =>
    run(`download-${m}`, async () => {
      const result = await reportDownloadUrl(token, m);
      if (!result.ok) throw new Error(result.error);
      window.location.href = result.data;
      return null;
    });

  const send = (m: string) =>
    run(`send-${m}`, async () => {
      const result = await sendReport(token, m);
      if (!result.ok) throw new Error(result.error);
      await reload();
      return `${label(m)} emailed to ${result.data.join(" and ")}.`;
    });

  // A fresh render with the AI summary switched on, stored nowhere — for
  // reading the summary before it is allowed into the monthly email.
  const preview = () =>
    run(`preview`, async () => {
      const tab = window.open("", "_blank");
      const res = await fetch(`/api/admin/reports/${month}?ai=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        tab?.close();
        throw new Error("The preview did not render. Try again.");
      }
      const url = URL.createObjectURL(await res.blob());
      if (tab) tab.location.href = url;
      else window.location.href = url;
      return null;
    });

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Reports"
        description="A website and shop report for the month before is generated and emailed on the 1st of every month. Every report is kept here."
      />

      <Card className="mt-8" title="Generate a report" description="Builds the report and keeps it here. Nothing is emailed until you press Send.">
        <div className="flex flex-wrap items-end gap-4 px-7 py-6">
          <label className="flex flex-col gap-2">
            <span className={FIELD_LABEL}>Month</span>
            <input
              type="month"
              value={month}
              max={lastMonthKey()}
              onChange={(e) => setMonth(e.target.value)}
              className={`${FIELD} w-auto`}
            />
          </label>
          <button type="button" onClick={generate} disabled={!!busy || !month} className={BTN_PRIMARY}>
            {busy === "generate" ? "Generating…" : "Generate"}
          </button>
          <button type="button" onClick={preview} disabled={!!busy || !month} className={BTN_QUIET}>
            {busy === "preview" ? "Rendering…" : "Preview with AI summary"}
          </button>
        </div>
      </Card>

      {(error || notice) && (
        <div className="mt-6">
          {error ? <Notice tone="error">{error}</Notice> : <Notice tone="ok">{notice}</Notice>}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : rows.length === 0 ? (
        <Card className="mt-6">
          <EmptyState message="No reports yet. The first one arrives on the 1st." />
        </Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.month} className={`${CARD} flex flex-wrap items-center justify-between gap-4 p-6`}>
              <div className="min-w-0">
                <p className="font-display text-xl text-ink">{label(r.month)}</p>
                <p className="mt-1 text-[13px] text-ink-mute">
                  Generated{" "}
                  {new Date(r.generated_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" · "}
                  {r.email_error ? (
                    <span className="text-red-800">email failed: {r.email_error}</span>
                  ) : r.emailed_to.length ? (
                    `emailed to ${r.emailed_to.join(", ")}`
                  ) : (
                    "not emailed"
                  )}
                  {!r.ga_available && " · website traffic unavailable"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => download(r.month)} disabled={!!busy} className={BTN_QUIET}>
                  {busy === `download-${r.month}` ? "Opening…" : "Download"}
                </button>
                <button type="button" onClick={() => send(r.month)} disabled={!!busy} className={BTN_QUIET}>
                  {busy === `send-${r.month}` ? "Sending…" : "Send"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
