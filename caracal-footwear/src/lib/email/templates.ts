import { formatZAR } from '@/lib/money';

export type EmailOrder = {
  order_number: string;
  email: string;
  customer_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

export type EmailItem = {
  product_name: string;
  colour: string;
  size: number;
  qty: number;
  unit_price: number;
};

export type Email = { subject: string; html: string };

export function esc(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildItemRows(items: EmailItem[]): string {
  if (items.length === 0) return '<tr><td colspan="5">No items</td></tr>';
  return items
    .map(
      (item) => `
    <tr>
      <td style="border-bottom:1px solid #eee; padding:8px;">${esc(item.product_name)}</td>
      <td style="border-bottom:1px solid #eee; padding:8px;">${esc(item.colour)}</td>
      <td style="border-bottom:1px solid #eee; padding:8px;">${item.size}</td>
      <td style="border-bottom:1px solid #eee; padding:8px;">${item.qty}</td>
      <td style="border-bottom:1px solid #eee; padding:8px; text-align:right;">${formatZAR(item.unit_price * item.qty)}</td>
    </tr>`
    )
    .join('');
}

function addressHtml(order: EmailOrder): string {
  const parts: string[] = [esc(order.address_line1)];
  if (order.address_line2) parts.push(esc(order.address_line2));
  parts.push(esc(order.city), esc(order.province), esc(order.postal_code));
  return parts.join('<br>');
}

export function orderConfirmation(order: EmailOrder, items: EmailItem[]): Email {
  const subject = `Your Caracal Footwear order ${order.order_number}`;
  const deliveryDisplay = order.delivery_fee === 0 ? 'Free' : formatZAR(order.delivery_fee);
  const itemRows = buildItemRows(items);
  const address = addressHtml(order);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <h2 style="margin-top:0;">Hi ${esc(order.customer_name)},</h2>
      <p>Thank you for your order! Your order number is <strong>${esc(order.order_number)}</strong>.</p>
      
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Product</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Colour</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Size</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Qty</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <table style="width:100%; margin-top:8px;">
        <tr>
          <td style="padding:4px 8px; text-align:right; font-weight:bold;">Subtotal</td>
          <td style="padding:4px 8px; text-align:right;">${formatZAR(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px; text-align:right; font-weight:bold;">Delivery</td>
          <td style="padding:4px 8px; text-align:right;">${deliveryDisplay}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px; text-align:right; font-weight:bold;">Total</td>
          <td style="padding:4px 8px; text-align:right; font-weight:bold;">${formatZAR(order.total)}</td>
        </tr>
      </table>

      <p style="margin-top:20px;"><strong>Delivery address:</strong><br> ${address}</p>
      <p style="margin-top:24px;">Handmade to order. We'll be in touch about shipping.</p>
      <p style="margin-top:32px; font-size:12px; color:#888;">Caracal Footwear</p>
    </div>
  `;
  return { subject, html };
}

export function adminOrderNotification(order: EmailOrder, items: EmailItem[]): Email {
  const subject = `New order ${order.order_number} — ${formatZAR(order.total)}`;
  const itemRows = buildItemRows(items);
  const address = addressHtml(order);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <h2 style="margin-top:0;">New paid order</h2>
      <p><strong>Customer:</strong> ${esc(order.customer_name)}</p>
      <p><strong>Email:</strong> ${esc(order.email)}</p>
      <p><strong>Phone:</strong> ${esc(order.phone)}</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Product</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Colour</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Size</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Qty</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <p style="text-align:right; font-weight:bold;">Total: ${formatZAR(order.total)}</p>
      <p><strong>Delivery address:</strong><br> ${address}</p>
    </div>
  `;
  return { subject, html };
}

export function stockConflictCustomerEmail(order: EmailOrder): Email {
  const subject = `About your order ${order.order_number}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <h2 style="margin-top:0;">Hi ${esc(order.customer_name)},</h2>
      <p>We're writing about your recent order <strong>${esc(order.order_number)}</strong>.</p>
      <p>Unfortunately, one or more items in your order sold out at the exact moment you paid. Your payment went through, but nothing has been shipped yet.</p>
      <p>We sincerely apologise for the inconvenience. A member of our team will be in touch shortly to arrange a replacement item or a full refund — whichever you prefer.</p>
      <p>Thank you for your patience and understanding.</p>
      <p style="margin-top:24px;">— Caracal Footwear</p>
    </div>
  `;
  return { subject, html };
}

export function stockConflictAdminEmail(order: EmailOrder, items: EmailItem[]): Email {
  const subject = `STOCK CONFLICT — order ${order.order_number} needs attention`;
  const itemRows = buildItemRows(items);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="color:red; font-weight:bold; font-size:18px; margin-bottom:16px;">⚠️ ACTION REQUIRED</div>
      <p style="color:red; font-weight:bold;">This order has a stock conflict and needs immediate attention.</p>
      <p><strong>Order:</strong> ${esc(order.order_number)}</p>
      <p><strong>Customer:</strong> ${esc(order.customer_name)}</p>
      <p><strong>Email:</strong> ${esc(order.email)}</p>
      <p><strong>Phone:</strong> ${esc(order.phone)}</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Product</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Colour</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Size</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:left;">Qty</th>
            <th style="border-bottom:1px solid #ddd; padding:8px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <p style="text-align:right; font-weight:bold;">Total: ${formatZAR(order.total)}</p>
      <p style="color:red; font-weight:bold;">Action needed: contact the customer to arrange a replacement or refund.</p>
    </div>
  `;
  return { subject, html };
}