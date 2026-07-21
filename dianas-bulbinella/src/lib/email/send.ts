/** Server-side senders that load an order and mail it out.
 *
 *  Everything here is best-effort by design: a failed send must never fail the
 *  caller. The ITN in particular MUST still return 200 to PayFast even if
 *  Resend is down — the money has landed either way, and a non-200 would just
 *  make PayFast retry a payment we've already processed.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, reportRecipient } from "@/lib/resend";
import {
  orderConfirmation,
  adminOrderNotification,
  fulfilmentEmail,
  type EmailOrder,
  type EmailItem,
} from "@/lib/email/templates";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3005")
  );
}

const ORDER_FIELDS =
  "id, order_number, email, full_name, phone, delivery_method, delivery_address, collection_point, subtotal, shipping, total, created_at";

const ITEM_FIELDS = "product_title, size, unit_price, qty, line_total";

async function loadOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(ORDER_FIELDS)
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await admin
    .from("order_items")
    .select(ITEM_FIELDS)
    .eq("order_id", orderId);

  return {
    order: order as unknown as EmailOrder,
    items: (items ?? []) as unknown as EmailItem[],
  };
}

/** Customer receipt + Diana's heads-up. Called from the PayFast ITN once an
 *  order is confirmed paid. */
export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order, items } = loaded;
    const url = siteUrl();

    const receipt = orderConfirmation(order, items, url);
    await sendEmail({
      to: order.email,
      subject: receipt.subject,
      html: receipt.html,
    });

    const admin = reportRecipient();
    if (admin) {
      const notice = adminOrderNotification(order, items, url);
      await sendEmail({
        to: admin,
        subject: notice.subject,
        html: notice.html,
        replyTo: order.email,
      });
    }
  } catch (error) {
    console.error("[email.sendPaidOrderEmails]", error);
  }
}

/** "On its way" / "collected" note to the customer. */
export async function sendFulfilmentEmail(
  orderId: string,
  kind: "shipped" | "collected"
): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order } = loaded;

    const mail = fulfilmentEmail(order, kind, siteUrl());
    await sendEmail({ to: order.email, subject: mail.subject, html: mail.html });
  } catch (error) {
    console.error("[email.sendFulfilmentEmail]", error);
  }
}
