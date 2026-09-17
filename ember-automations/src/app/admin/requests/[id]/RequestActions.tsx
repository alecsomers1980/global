"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/lib/spine/types";

export default function RequestActions({ id, status, updatedAt, allowed }: { id: string; status: RequestStatus; updatedAt: string; allowed: RequestStatus[] }) {
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const move = async (to: RequestStatus) => {
    setMsg("");
    const res = await fetch(`/api/admin/spine/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, expectedUpdatedAt: updatedAt }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 409 && body.max_active !== undefined) {
        setMsg(`Max active requests reached (limit ${body.max_active}) — deliver or cancel another first.`);
      } else if (res.status === 409 && (body.error === "current" || body.current !== undefined)) {
        setMsg("This request changed since you loaded it — refresh.");
      } else {
        setMsg(body.error ?? "failed");
      }
      return;
    }

    router.refresh();
  };

  const retriage = async () => {
    setMsg("");
    const res = await fetch(`/api/admin/spine/requests/${id}/retriage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "failed");
      return;
    }

    setMsg("Triage queued for approval");
    router.refresh();
  };

  return (
    <div className="glass p-6 space-y-4" data-status={status}>
      <div className="flex flex-wrap gap-2">
        {allowed.map((to) => {
          const label = to.replace(/_/g, " ");
          const isPrimary = to === allowed[0];
          const danger = to === "cancelled";
          const className = danger
            ? "border border-[#2a2a3d] text-red-400 px-4 py-2 rounded-lg text-sm"
            : isPrimary
              ? "bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm"
              : "bg-dark-600 px-4 py-2 rounded-lg text-sm";

          return (
            <button key={to} className={className} onClick={() => move(to)}>
              {label}
            </button>
          );
        })}
        <button className="bg-dark-600 px-4 py-2 rounded-lg text-sm" onClick={retriage}>
          Re-triage
        </button>
      </div>
      {msg ? <p className="text-sm text-[#6b6b8a]">{msg}</p> : null}
    </div>
  );
}
