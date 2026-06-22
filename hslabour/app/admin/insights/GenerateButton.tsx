"use client";

import { useActionState } from "react";
import { generateInsightNow } from "./actions";

export default function GenerateButton() {
  const [state, action, pending] = useActionState(generateInsightNow, undefined);

  return (
    <div className="flex flex-col gap-2">
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-mint disabled:opacity-60"
        >
          {pending ? "Generating… (~30s)" : "Generate with AI"}
        </button>
      </form>
      {state?.error && (
        <p className="max-w-md text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
