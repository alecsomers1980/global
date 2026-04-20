"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { autoFixSeoForCar } from "./seo_actions";

export default function SeoFixButton({ car }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [isPending, startTransition] = useTransition();

    const hasSeo = !!car.seo_updated_at;
    const pending = busy || isPending;

    async function handleClick() {
        if (pending) return;
        const msg = hasSeo
            ? `Re-generate SEO title, description, and image alts for ${car.year} ${car.make} ${car.model}? This replaces existing values.`
            : `Generate SEO title, description, and image alts for ${car.year} ${car.make} ${car.model}?`;
        if (!confirm(msg)) return;

        setBusy(true);
        try {
            const result = await autoFixSeoForCar(car.id);
            if (!result?.success) {
                alert(result?.error || "SEO fix failed");
            } else {
                startTransition(() => router.refresh());
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className={`p-2 transition-colors ${pending
                ? "text-slate-300"
                : hasSeo
                    ? "text-purple-500 hover:text-purple-700"
                    : "text-slate-400 hover:text-purple-600"
                }`}
            title={pending
                ? "Generating SEO..."
                : hasSeo
                    ? "Re-generate SEO (title + alts)"
                    : "Auto-Fix SEO (title + alts)"}
        >
            <span className={`material-symbols-outlined ${pending ? "animate-spin" : ""}`}>
                {pending ? "sync" : "auto_fix_high"}
            </span>
        </button>
    );
}
