import { parsePlan, periodOf } from "@/lib/spine/plan";
import type { ClientStatus } from "@/lib/spine/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function shouldGrant(
  client: { status: ClientStatus; plan: unknown },
  existingPeriods: string[],
  now: Date,
): { grant: boolean; period: string; credits: number } {
  const plan = parsePlan(client.plan);
  const period = periodOf(now);
  const credits = plan.monthly_credits;

  const grant =
    client.status === "active" &&
    credits > 0 &&
    now.getUTCDate() === plan.renews_on &&
    !existingPeriods.includes(period);

  return { grant, period, credits };
}

export async function runMonthlyGrant(
  db: SupabaseClient,
  now: Date = new Date(),
): Promise<{ granted: { client_id: string; credits: number }[] }> {
  const { data: clients, error: clientsError } = await db
    .from("clients")
    .select("id, status, plan")
    .eq("status", "active");

  if (clientsError) {
    throw new Error(clientsError.message);
  }

  const granted: { client_id: string; credits: number }[] = [];

  for (const client of clients ?? []) {
    const { data: periods, error: periodsError } = await db
      .from("credits_ledger")
      .select("period")
      .eq("client_id", client.id)
      .eq("reason", "monthly_grant");

    if (periodsError) {
      throw new Error(periodsError.message);
    }

    const existingPeriods = (periods ?? []).map((row) => String(row.period));

    const status: ClientStatus =
      client.status === "active"
        ? "active"
        : client.status === "paused"
          ? "paused"
          : "archived";

    const result = shouldGrant({ status, plan: client.plan }, existingPeriods, now);

    if (result.grant) {
      const { error: insertError } = await db.from("credits_ledger").insert({
        client_id: client.id,
        delta: result.credits,
        reason: "monthly_grant",
        period: result.period,
        note: "monthly grant",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      granted.push({ client_id: client.id, credits: result.credits });
    }
  }

  return { granted };
}

