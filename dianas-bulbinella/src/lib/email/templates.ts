/** Transactional email bodies. Plain inline-styled tables — they have to
 *  survive Gmail and Outlook, which strip <style> blocks and flexbox. */

import { formatZAR } from "@/lib/catalog";

export type EmailOrder = {
  id: string;
  order_number: string;
  email: string;
  full_name: string;
  phone: string;
  delivery_method: string;
  delivery_address: any;
  collection_point: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
};

export type EmailItem = {
  product_title: string;
  size: string;
  unit_price: number;
  qty: number;
  line_total: number;
};

export type Email = { subject: string; html: string };

/** Escape user-supplied text. Tolerates null/undefined because several of
 *  these columns are nullable (phone, collection_point, size…). */
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Postgres `numeric` can come back as a string — coerce before formatting. */
function money(value: unknown): string {
  return formatZAR(Number(value) || 0);
}

function button(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" bgcolor="#2F4A3C" style="border-radius:999px;">
          <a href="${esc(href)}" style="display:inline-block; padding:12px 28px; color:#ffffff; text-decoration:none; font-weight:bold; font-family:Arial,Helvetica,sans-serif; font-size:15px;">${esc(label)}</a>
        </td>
      </tr>
    </table>`;
}

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diana&#39;s Bulbinella</title>
</head>
<body style="margin:0; padding:0; background-color:#F7F4EC; font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F7F4EC">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="max-width:600px; border-radius:12px;">
          <tr>
            <td style="padding:32px 32px 8px; text-align:center;">
              <span style="font-family:Georgia,serif; color:#2F4A3C; font-size:26px;">Diana&#39;s Bulbinella</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px; color:#2A2A2A; font-size:15px; line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px; border-top:1px solid #E5E7EB; color:#6B7280; font-size:12px; text-align:center;">
              Diana&#39;s Bulbinella &middot; Western Cape, South Africa
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: EmailItem[]): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0; vertical-align:top; border-bottom:1px solid #F1EFE8;">
        ${esc(item.product_title)}
        ${item.size ? `<br><span style="color:#6B7280; font-size:13px;">${esc(item.size)}</span>` : ""}
      </td>
      <td style="padding:10px 0; text-align:right; vertical-align:top; border-bottom:1px solid #F1EFE8;">${esc(item.qty)}</td>
      <td style="padding:10px 0; text-align:right; vertical-align:top; border-bottom:1px solid #F1EFE8;">${money(item.line_total)}</td>
    </tr>`
    )
    .join("\n");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:20px 0 0;">
      <thead>
        <tr>
          <th style="text-align:left; padding:0 0 8px; color:#6B7280; font-size:13px; font-weight:normal; border-bottom:1px solid #E5E7EB;">Item</th>
          <th style="text-align:right; padding:0 0 8px; color:#6B7280; font-size:13px; font-weight:normal; border-bottom:1px solid #E5E7EB;">Qty</th>
          <th style="text-align:right; padding:0 0 8px; color:#6B7280; font-size:13px; font-weight:normal; border-bottom:1px solid #E5E7EB;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsTable(order: EmailOrder): string {
  const shipping =
    Number(order.shipping) === 0 ? "Free" : money(order.shipping);
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:12px;">
      <tr><td style="padding:3px 0; text-align:right; color:#6B7280;">Subtotal: ${money(order.subtotal)}</td></tr>
      <tr><td style="padding:3px 0; text-align:right; color:#6B7280;">Shipping: ${shipping}</td></tr>
      <tr><td style="padding:6px 0; text-align:right; font-weight:bold; font-size:16px;">Total: ${money(order.total)}</td></tr>
    </table>`;
}

function addressLines(order: EmailOrder): string {
  const addr = order.delivery_address ?? {};
  return [addr.line1, addr.line2, addr.city, addr.province, addr.postal_code]
    .filter(Boolean)
    .map(esc)
    .join("<br>");
}

function deliveryBlock(order: EmailOrder): string {
  if (order.delivery_method === "collection") {
    return `<p style="margin:20px 0 0;"><strong>Collection</strong><br>${
      esc(order.collection_point) || "Details to follow"
    }</p>`;
  }
  return `<p style="margin:20px 0 0;"><strong>Delivery to</strong><br>${
    addressLines(order) || "No address on file"
  }</p>`;
}

export function orderConfirmation(
  order: EmailOrder,
  items: EmailItem[],
  siteUrl: string
): Email {
  const body = `
    <p>Hi ${esc(order.full_name) || "there"},</p>
    <p>Thank you for your order — your payment has come through and we&#39;re getting it ready.</p>
    <p style="color:#6B7280; font-size:13px;">Order ${esc(order.order_number)}</p>
    ${itemsTable(items)}
    ${totalsTable(order)}
    ${deliveryBlock(order)}
    ${button(`${siteUrl}/account/orders`, "View your order")}
    <p>We&#39;ll let you know as soon as it&#39;s on its way.</p>`;

  return { subject: `Order ${order.order_number} — thank you!`, html: layout(body) };
}

export function adminOrderNotification(
  order: EmailOrder,
  items: EmailItem[],
  siteUrl: string
): Email {
  const body = `
    <p><strong>New order received</strong></p>
    <p style="color:#6B7280; font-size:13px;">Order ${esc(order.order_number)}</p>
    <p>
      ${esc(order.full_name) || "—"}<br>
      ${esc(order.email)}<br>
      ${esc(order.phone) || "No phone given"}
    </p>
    ${itemsTable(items)}
    ${totalsTable(order)}
    ${deliveryBlock(order)}
    ${button(`${siteUrl}/admin/orders/${order.id}`, "Open in admin")}`;

  return {
    subject: `New order ${order.order_number} — ${money(order.total)}`,
    html: layout(body),
  };
}

export function fulfilmentEmail(
  order: EmailOrder,
  kind: "shipped" | "collected",
  siteUrl: string
): Email {
  const greeting = `<p>Hi ${esc(order.full_name) || "there"},</p>`;

  if (kind === "shipped") {
    const body = `
      ${greeting}
      <p>Good news — order <strong>${esc(order.order_number)}</strong> is on its way to you.</p>
      <p style="margin:20px 0 0;"><strong>Shipping to</strong><br>${
        addressLines(order) || "the address on your order"
      }</p>
      ${button(`${siteUrl}/account/orders`, "View your order")}`;
    return {
      subject: `Order ${order.order_number} is on its way`,
      html: layout(body),
    };
  }

  const body = `
    ${greeting}
    <p>Thank you for collecting order <strong>${esc(order.order_number)}</strong>. We hope you love it.</p>
    ${button(`${siteUrl}/account/orders`, "View your order")}`;
  return {
    subject: `Order ${order.order_number} — collected`,
    html: layout(body),
  };
}

export function reorderReminder(
  order: EmailOrder,
  items: EmailItem[],
  siteUrl: string
): Email {
  const placed = new Date(order.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const list = items
    .map(
      (item) =>
        `<li style="margin-bottom:4px;">${esc(item.product_title)}${
          item.size ? ` <span style="color:#6B7280;">(${esc(item.size)})</span>` : ""
        }</li>`
    )
    .join("\n");

  const body = `
    <p>Hi ${esc(order.full_name) || "there"},</p>
    <p>It&#39;s been a little while since your last order (${esc(
      order.order_number
    )}, placed on ${esc(placed)}). If you&#39;re running low, topping up is one click away.</p>
    <ul style="padding-left:20px; margin:16px 0 0;">${list}</ul>
    ${button(`${siteUrl}/account/orders/${order.id}`, "Reorder these")}
    <p style="color:#6B7280; font-size:13px;">If you&#39;d rather not get these reminders, just reply to this email and we&#39;ll stop them.</p>`;

  return { subject: "Running low? Reorder your favourites", html: layout(body) };
}
