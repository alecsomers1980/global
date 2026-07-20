import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { siteUrl } from "@/lib/email/send";
import { reviewRequest, type EmailOrder } from "@/lib/email/templates";
import { fetchAll } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Days after fulfilment before we ask for a review. */
const DEFAULT_DELAY_DAYS = 14;

/** Never ask about an order fulfilled longer ago than this. This is the guard
 *  that stops the FIRST run of this cron mailing everyone in the backlog. */
const DEFAULT_MAX_AGE_DAYS = 60;

/**
 * Asks recent customers to review what they bought.
 *
 * Four rules keep this from becoming spam:
 *   - `legacy = false` — the 4,626 imported Woo orders are NEVER mailed. They
 *     are up to eight years old and their owners never opted into anything on
 *     this site; mailing them would be both useless and a POPIA problem.
 *   - a fulfilment-age WINDOW, not just a floor, so switching the cron on
 *     doesn't blast every order ever fulfilled.
 *   - `review_requests` has a unique index on order_id — one request per order,
 *     ever, even if this runs twice in a day.
 *   - products the customer has already reviewed are dropped; if that leaves
 *     nothing to ask about, no email is sent at all.
 *
 * NOTE: this is treated as a post-purchase TRANSACTIONAL message (like the
 * shipping notice), so it does not require `marketing_opt_in` — which is how
 * review requests normally work, and is also the only way it can ever send,
 * since every imported profile has marketing_opt_in = false. If Diana wants it
 * gated on marketing consent instead, add the opt-in filter to the profile
 * lookup below.
 *
 * `?dryRun=1` reports who *would* be mailed without sending or recording.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const delayDays = Number(process.env.REVIEW_REQUEST_DELAY_DAYS) || DEFAULT_DELAY_DAYS;
    const maxAgeDays = Number(process.env.REVIEW_REQUEST_MAX_AGE_DAYS) || DEFAULT_MAX_AGE_DAYS;
    const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

    const day = 24 * 60 * 60 * 1000;
    const sendBefore = new Date(Date.now() - delayDays * day); // fulfilled at least this long ago
    const sendAfter = new Date(Date.now() - maxAgeDays * day); // ...but not older than this

    const admin = createAdminClient();

    const orders = await fetchAll<EmailOrder & { id: string; user_id: string }>((from, to) =>
      admin
        .from("orders")
        .select(
          "id, user_id, order_number, email, full_name, phone, delivery_method, delivery_address, collection_point, subtotal, shipping, total, created_at"
        )
        .eq("legacy", false)
        .in("status", ["shipped", "collected"])
        .not("user_id", "is", null)
        .lte("fulfilled_at", sendBefore.toISOString())
        .gte("fulfilled_at", sendAfter.toISOString())
        .range(from, to)
    );

    if (orders.length === 0) {
      return NextResponse.json({ success: true, considered: 0, sent: 0 });
    }

    const alreadyAsked = await fetchAll<{ order_id: string }>((from, to) =>
      admin.from("review_requests").select("order_id").range(from, to)
    );
    const askedFor = new Set(alreadyAsked.map((r) => r.order_id));

    const candidates = orders.filter((o) => !askedFor.has(o.id));
    if (candidates.length === 0) {
      return NextResponse.json({ success: true, considered: orders.length, sent: 0 });
    }

    const url = siteUrl();
    let sent = 0;
    let skippedNothingToAsk = 0;
    const failed: string[] = [];
    const wouldSend: { order_number: string; email: string; products: string[] }[] = [];

    for (const order of candidates) {
      // What did they buy that maps to a live product?
      const { data: items } = await admin
        .from("order_items")
        .select("product_id, products(title, slug)")
        .eq("order_id", order.id)
        .not("product_id", "is", null);

      // Anything they've already reviewed is dropped — never ask twice.
      const { data: reviewed } = await admin
        .from("reviews")
        .select("product_id")
        .eq("user_id", order.user_id);
      const reviewedIds = new Set((reviewed ?? []).map((r) => r.product_id));

      const seen = new Set<string>();
      const products: { title: string; slug: string }[] = [];
      for (const item of (items ?? []) as unknown as {
        product_id: string;
        products: { title: string; slug: string } | null;
      }[]) {
        if (!item.products) continue;
        if (reviewedIds.has(item.product_id)) continue;
        if (seen.has(item.product_id)) continue;
        seen.add(item.product_id);
        products.push(item.products);
      }

      if (products.length === 0) {
        skippedNothingToAsk += 1;
        continue;
      }

      if (dryRun) {
        wouldSend.push({
          order_number: order.order_number,
          email: order.email,
          products: products.map((p) => p.title),
        });
        continue;
      }

      const mail = reviewRequest(order, products, url);
      const result = await sendEmail({ to: order.email, subject: mail.subject, html: mail.html });

      if (!result.success) {
        // Don't record it — a failed send should be retried tomorrow.
        failed.push(order.order_number);
        continue;
      }

      await admin
        .from("review_requests")
        .insert({ user_id: order.user_id, order_id: order.id });
      sent += 1;
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        considered: candidates.length,
        skippedNothingToAsk,
        wouldSend,
      });
    }

    return NextResponse.json({
      success: true,
      considered: candidates.length,
      skippedNothingToAsk,
      sent,
      failed,
    });
  } catch (error: any) {
    console.error("[cron.review-requests]", error);
    return NextResponse.json(
      { error: error?.message || "Could not send review requests." },
      { status: 500 }
    );
  }
}
