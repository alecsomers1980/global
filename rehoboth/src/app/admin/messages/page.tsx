"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { listMessages, setMessageHandled, type AdminMessage } from "../actions";

const FILTERS = [
  { value: "open", label: "To answer" },
  { value: "handled", label: "Answered" },
  { value: "all", label: "All" },
];

const SMALL_BTN =
  "min-h-[40px] border border-hairline px-3 text-[13px] text-ink-soft hover:border-brand hover:text-brand disabled:opacity-50";

export default function AdminMessagesPage() {
  const token = useAdminToken();
  const [rows, setRows] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await listMessages(token, filter);
      if (cancelled) return;
      if (result.ok) setRows(result.data);
      else setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, filter]);

  async function toggle(id: string, handled: boolean) {
    if (!token || busyId) return;
    setBusyId(id);
    const result = await setMessageHandled(token, id, handled);
    if (result.ok) {
      const reload = await listMessages(token, filter);
      if (reload.ok) setRows(reload.data);
    } else {
      setError(result.error);
    }
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>
      <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-ink-soft">
        Everything sent through the contact form is kept here, whether or not the
        notification email went out. This list is the record — nothing is lost if
        email stops working.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "min-h-[40px] bg-brand px-4 text-[13px] uppercase tracking-[0.06em] text-brand-ink"
                : "min-h-[40px] border border-hairline px-4 text-[13px] uppercase tracking-[0.06em] text-ink-soft hover:border-brand"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ink-mute">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-ink-mute">Nothing here.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map((m) => (
            <li key={m.id} className="border border-hairline bg-white p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <span className="text-[15px] font-medium text-ink">{m.name}</span>
                  <span className="ml-3 text-[13px] text-ink-mute">{m.subject ?? "No subject"}</span>
                </div>
                <span className="text-[13px] text-ink-mute">
                  {new Date(m.created_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {!m.emailed && " · email not sent"}
                </span>
              </div>

              <p className="mt-1 text-[13px] text-ink-mute">
                <a href={`mailto:${m.email}`} className="underline hover:text-brand">{m.email}</a>
                {m.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="underline hover:text-brand">
                      {m.phone}
                    </a>
                  </>
                )}
              </p>

              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                {m.message}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "Your message")}`} className={SMALL_BTN}>
                  Reply by email
                </a>
                <button type="button" onClick={() => toggle(m.id, !m.handled)} disabled={busyId === m.id} className={SMALL_BTN}>
                  {m.handled ? "Move back to answer" : "Mark answered"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
