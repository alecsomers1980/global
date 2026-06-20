"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

interface Props {
  affiliateCode: string;
  siteUrl: string;
}

export default function LinkGeneratorClient({ affiliateCode, siteUrl }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const origin = siteUrl.replace(/\/$/, "");
  const links = [
    {
      label: "Homepage",
      url: `${origin}/?ref=${affiliateCode}`,
    },
    {
      label: "Affiliate landing page",
      url: `${origin}/affiliate-program?ref=${affiliateCode}`,
    },
  ];

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!affiliateCode || affiliateCode === "PENDING") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
          <Link2 className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-navy">Your referral links</h2>
        <p className="mt-1 text-sm text-slate-500">
          Share these links. Sales from anyone who clicks them are credited to you.
        </p>
        <p className="mt-6 rounded-lg bg-mint p-4 text-sm text-navy">
          Your links activate as soon as an admin approves your application.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
        <Link2 className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-navy">Your referral links</h2>
      <p className="mt-1 text-sm text-slate-500">
        Share these links. Sales from anyone who clicks them are credited to you.
      </p>
      <div className="mt-6 space-y-3">
        {links.map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {l.label}
              </p>
              <p className="truncate text-sm text-ink">{l.url}</p>
            </div>
            <button
              onClick={() => copy(l.url)}
              className="inline-flex shrink-0 items-center gap-1 rounded bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
            >
              {copied === l.url ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}