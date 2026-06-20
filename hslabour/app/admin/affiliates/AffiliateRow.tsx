"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAffiliate, declineAffiliate } from "./actions";
import { Check, X, Loader2 } from "lucide-react";

export interface Affiliate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  is_approved: boolean;
  affiliate_code: string | null;
}

export default function AffiliateRow({ affiliate }: { affiliate: Affiliate }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.success) setError(res.error || "Failed");
      else router.refresh();
    });
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-sm">
        <span className="font-medium text-navy">
          {[affiliate.first_name, affiliate.last_name].filter(Boolean).join(" ") || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{affiliate.email}</td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {new Date(affiliate.created_at).toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="px-4 py-3 text-sm">
        {affiliate.is_approved ? (
          <span className="rounded-full bg-green/15 px-2 py-1 text-xs font-semibold text-green-dark">
            Approved
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            Pending
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-mono text-navy">
        {affiliate.affiliate_code || "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          {error && <span className="text-xs text-red-600">{error}</span>}

          {!affiliate.is_approved && (
            <button
              onClick={() => run(() => approveAffiliate(affiliate.id, affiliate.first_name))}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded bg-green px-3 py-1.5 text-xs font-semibold text-navy hover:bg-green-dark disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
          )}

          <button
            onClick={() => run(() => declineAffiliate(affiliate.id))}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            {affiliate.is_approved ? "Revoke" : "Decline"}
          </button>
        </div>
      </td>
    </tr>
  );
}