/** Server-side senders that load an order and mail it out.
 *
 *  Everything here is best-effort by design: a failed send must never fail
 *  the caller. The ITN handler in particular MUST still return 200 to
 *  PayFast even if Resend is down -- the money has landed either way, and a
 *  non-200 would just make PayFast retry a payment we've already processed.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, reportRecipient } from '@/lib/resend';
import {
  orderConfirmation,
  adminOrderNotification,
  stockConflictCustomerEmail,
  stockConflictAdminEmail,
  type EmailOrder,
  type EmailItem,
} from '@/lib/email/templates';

const ORDER_FIELDS =
  'order_number, email, customer_name, phone, address_line1, address_line2, city, province, postal_code, subtotal, delivery_fee, total, created_at';

const ITEM_FIELDS = 'product_name, colour, size, qty, unit_price';

async function loadOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await admin.from('order_items').select(ITEM_FIELDS).eq('order_id', orderId);

  return {
    order: order as unknown as EmailOrder,
    items: (items ?? []) as unknown as EmailItem[],
  };
}

/** Customer receipt + Donald's heads-up. Called from the PayFast ITN once an
 *  order is confirmed paid AND stock decremented cleanly. */
export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order, items } = loaded;

    const receipt = orderConfirmation(order, items);
    await sendEmail({ to: order.email, subject: receipt.subject, html: receipt.html });

    const admin = reportRecipient();
    if (admin) {
      const notice = adminOrderNotification(order, items);
      await sendEmail({ to: admin, subject: notice.subject, html: notice.html, replyTo: order.email });
    }
  } catch (error) {
    console.error('[email.sendPaidOrderEmails]', error);
  }
}

/** Called from the PayFast ITN when payment cleared but stock could not
 *  cover the order. Both the customer and Donald need to know immediately. */
export async function sendStockConflictEmails(orderId: string): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order, items } = loaded;

    const customerMail = stockConflictCustomerEmail(order);
    await sendEmail({ to: order.email, subject: customerMail.subject, html: customerMail.html });

    const admin = reportRecipient();
    if (admin) {
      const adminMail = stockConflictAdminEmail(order, items);
      await sendEmail({ to: admin, subject: adminMail.subject, html: adminMail.html, replyTo: order.email });
    }
  } catch (error) {
    console.error('[email.sendStockConflictEmails]', error);
  }
}
