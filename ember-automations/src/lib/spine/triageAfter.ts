import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { triageAndQueue } from "./triageRun";

/**
 * Run triage once the response has already gone out.
 *
 * A DeepSeek triage call takes up to its 25s cap, which is longer than a client's
 * Claude — or a browser — should wait to hear that a request was logged. `after()`
 * keeps the work inside the same invocation (a bare floating promise would be killed
 * when the serverless function returns), so the caller gets an instant answer and the
 * estimate appears in the queue a moment later. A failure leaves the request
 * `submitted` with its `triage_failed` event for Alec to re-triage from /admin.
 */
export function triageInBackground(db: SupabaseClient, requestId: string): void {
  after(async () => {
    try {
      await triageAndQueue(db, requestId);
    } catch (error) {
      console.error("background triage failed:", requestId, error);
    }
  });
}
