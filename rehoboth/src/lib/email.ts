import { Resend } from "resend";
import type { OrderRecord } from "./orders";
import { rands } from "./money";

/**
 * Order email.
 *
 * The Resend client is constructed inside the call, never at module scope —
 * the constructor needs an API key and this module is imported by a route that
 * must keep working when email is not configured.
 *
 * Nothing here throws. A failed send is logged and swallowed by the caller:
 * a payment that succeeded is not undone by an email that did not.
 */

const FROM = "Rehoboth Herbal Co. <orders@rehobothherbal.co.za>";

export async function sendOrderEmails(order: OrderRecord): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY unset — no email sent for ${order.reference}`);
    return;
  }

  const resend = new Resend(key);
  const html = orderHtml(order);

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your Rehoboth order ${order.reference}`,
    html,
  });

  const notify = process.env.ORDER_NOTIFY_EMAIL;
  if (notify) {
    await resend.emails.send({
      from: FROM,
      to: notify,
      subject: `New order ${order.reference} — ${rands(order.total)}`,
      html,
    });
  }
}

function orderHtml(order: OrderRecord): string {
  const rows = order.order_items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #DFE9E4">
          ${esc(i.product_name)}<br>
          <span style="color:#808D88;font-size:13px">${esc(i.size_label)} × ${i.qty}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #DFE9E4;text-align:right">
          ${rands(i.unit_price * i.qty)}
        </td>
      </tr>`
    )
    .join("");

  const delivery = order.collect_from_farm
    ? "Collection from Rehoboth Farm, Low&rsquo;s Creek"
    : "Delivery";

  return `<div style="font-family:Helvetica,Arial,sans-serif;color:#1B2521;max-width:520px">
    <h1 style="font-size:22px;font-weight:normal">Thank you, ${esc(firstName(order.customer_name))}.</h1>
    <p style="color:#56635E;line-height:1.6">
      We have your order <strong>${esc(order.reference)}</strong> and your payment has cleared.
      We pack by hand on the farm, so give us a day or two before it goes out.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0">
      ${rows}
      <tr><td style="padding:8px 0">Subtotal</td>
          <td style="padding:8px 0;text-align:right">${rands(order.subtotal)}</td></tr>
      <tr><td style="padding:0 0 8px">${delivery}</td>
          <td style="padding:0 0 8px;text-align:right">${order.shipping === 0 ? "Free" : rands(order.shipping)}</td></tr>
      <tr><td style="padding:8px 0;border-top:2px solid #1B2521"><strong>Total</strong></td>
          <td style="padding:8px 0;border-top:2px solid #1B2521;text-align:right"><strong>${rands(order.total)}</strong></td></tr>
    </table>
    <p style="color:#808D88;font-size:13px;line-height:1.6">
      Questions? Reply to this email or call 082 824 9023.<br>
      Rehoboth Farm, Portion 21 of Farm 277JU Lovedale, Honeybird, Low&rsquo;s Creek, Mpumalanga.
    </p>
  </div>`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
