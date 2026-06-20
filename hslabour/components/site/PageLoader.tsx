import { Loader2 } from "lucide-react";

/** Lightweight full-height loading state for streaming route segments. */
export default function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-green-dark" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
