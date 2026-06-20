"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCommissionStatus } from "./actions";

export default function CommissionActions({
  id,
  status,
}: {
  id: string;
  status: "pending" | "approved" | "paid";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function go(next: "approved" | "paid") {
    startTransition(async () => {
      await setCommissionStatus(id, next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <button
          onClick={() => go("approved")}
          disabled={isPending}
          className="rounded bg-green px-2 py-1 text-xs font-semibold text-navy hover:bg-green-dark disabled:opacity-60"
        >
          Approve
        </button>
      )}
      {status !== "paid" && (
        <button
          onClick={() => go("paid")}
          disabled={isPending}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          Mark paid
        </button>
      )}
      {status === "paid" && (
        <span className="text-xs font-semibold text-green-dark">Paid</span>
      )}
    </div>
  );
}