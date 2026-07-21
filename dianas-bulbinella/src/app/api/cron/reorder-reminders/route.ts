import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { siteUrl } from "@/lib/email/send";
import { reorderReminder, type EmailOrder, type EmailItem } from "@/lib/email/templates";
import { PAID_STATUSES } from "@/lib/orders";
import { fetchAll } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

/** How long after someone's last order to nudge them. */
const DEFAULT_DAYS = 60;

/**
 * Nudges customers whose most recent paid order is older than
 * REORDER_REMINDER_DAYS and who haven't ordered since.
 *
 * Two rules keep this from becoming spam:
 *   - only customers with marketing_opt_in = true are mailed;
 *   - reorder_reminders has a unique index on last_order_id, so any given
 *     order can only ever trigger one reminder.
 *
 * `?dryRun=1` reports who *would* be mailed without sending or recording.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const days = Number(process.env.REORDER_REMINDER_DAYS) || DEFAULT_DAYS;
    const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const admin = createAdminClient();

    // fetchAll, not a plain select: PostgREST truncates at 1000 rows and there
    // are ~3,400 paid orders with a user. A truncated list would make the
    // "latest order per customer" wrong and nudge the wrong people.
    const orders = await fetchAll<any>((from, to) =>
      admin
        .from("orders")
        .select(
          "id, user_id, order_number, email, full_name, phone, delivery_method, delivery_address, collection_point, subtotal, shipping, total, created_at"
        )
        .in("status", PAID_STATUSES)
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    // Newest first, so the first order seen for a user IS their latest.
    const latestByUser = new Map<string, EmailOrder>();
    for (const order of orders) {
      if (!latestByUser.has(order.user_id)) {
        latestByUser.set(order.user_id, order as EmailOrder);
      }
    }

    // Anyone who has ordered more recently than the cutoff doesn't need a nudge.
    const due = [...latestByUser.entries()].filter(
      ([, order]) => new Date(order.created_at) < cutoff
    );
    if (due.length === 0) {
      return NextResponse.json({ success: true, sent: 0, considered: 0 });
    }

    // Ask for the opted-in customers directly rather than passing ~1,800 ids
    // through .in() — that would build an enormous URL and truncate at 1000.
    const [profiles, alreadySent] = await Promise.all([
      fetchAll<{ id: string }>((from, to) =>
        admin
          .from("profiles")
          .select("id")
          .eq("role", "customer")
          .eq("marketing_opt_in", true)
          .range(from, to)
      ),
      fetchAll<{ last_order_id: string }>((from, to) =>
        admin.from("reorder_reminders").select("last_order_id").range(from, to)
      ),
    ]);

    const optedIn = new Set(profiles.map((p) => p.id));
    const sentFor = new Set(alreadySent.map((r) => r.last_order_id));

    const targets = due.filter(
      ([userId, order]) => optedIn.has(userId) && !sentFor.has(order.id)
    );

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        considered: due.length,
        wouldSend: targets.map(([, o]) => ({
          order_number: o.order_number,
          email: o.email,
          last_ordered: o.created_at,
        })),
      });
    }

    const url = siteUrl();
    let sent = 0;
    const failed: string[] = [];

    for (const [userId, order] of targets) {
      const { data: items } = await admin
        .from("order_items")
        .select("product_title, size, unit_price, qty, line_total")
        .eq("order_id", order.id);

      const mail = reorderReminder(
        order,
        (items ?? []) as unknown as EmailItem[],
        url
      );
      const result = await sendEmail({
        to: order.email,
        subject: mail.subject,
        html: mail.html,
      });

      if (!result.success) {
        // Don't record it — a failed send should be retried tomorrow.
        failed.push(order.order_number);
        continue;
      }

      await admin
        .from("reorder_reminders")
        .insert({ user_id: userId, last_order_id: order.id });
      sent += 1;
    }

    return NextResponse.json({
      success: true,
      considered: due.length,
      sent,
      failed,
    });
  } catch (error: any) {
    console.error("[cron.reorder-reminders]", error);
    return NextResponse.json(
      { error: error?.message || "Could not send reminders." },
      { status: 500 }
    );
  }
}
