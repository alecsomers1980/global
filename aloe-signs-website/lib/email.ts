import nodemailer from 'nodemailer';
import { Order } from './orders';
import { formatPrice } from './utils';
import {
  buildEmailHtml,
  buildButton,
  buildSectionHeading,
  buildInfoRow,
  buildDetailsTable,
  buildInfoBox,
  buildStatusBadge,
  buildDivider,
  brand,
} from './emailTemplate';

// ─── Transporter ──────────────────────────────────────────────────────────────

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }
  return nodemailer.createTransport(emailConfig);
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za';

// ─── Public Senders ───────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"Aloe Signs" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation — ${order.orderNumber}`,
      text: generateOrderConfirmationText(order),
      html: buildEmailHtml(
        'Order Confirmation',
        generateOrderConfirmationBody(order),
        `Order #${order.orderNumber} confirmed — thank you!`
      ),
    });
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(
  order: Order,
  previousStatus: string
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"Aloe Signs" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Update — ${order.orderNumber}`,
      text: generateStatusUpdateText(order, previousStatus),
      html: buildEmailHtml(
        'Order Status Update',
        generateStatusUpdateBody(order),
        `Your order #${order.orderNumber} status has been updated.`
      ),
    });
    console.log(`Status update email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return false;
  }
}

export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_EMAIL || 'alec@firewireit.co.za';

  try {
    await transporter.sendMail({
      from: `"Aloe Signs Website" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Order Received — ${order.orderNumber}`,
      text: generateAdminNotificationText(order),
      html: buildEmailHtml(
        'New Order Received',
        generateAdminNotificationBody(order),
        `New order #${order.orderNumber} from ${order.customerName}`
      ),
    });
    console.log(`Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

// ─── HTML Body Generators ─────────────────────────────────────────────────────

function generateOrderConfirmationBody(order: Order): string {
  const itemsRows = order.items.map(item => `
    <tr>
      <td style="padding:14px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};">
        <strong>${item.name}</strong>
        <br><span style="font-size:12px;color:${brand.textMuted};">${item.size}</span>
      </td>
      <td style="padding:14px 16px;font-size:14px;color:${brand.textMid};text-align:center;border-bottom:1px solid ${brand.border};">${item.quantity}</td>
      <td style="padding:14px 16px;font-size:14px;color:${brand.textDark};text-align:right;font-weight:600;border-bottom:1px solid ${brand.border};">R${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const firstName = order.customerName.split(' ')[0];

  return `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:72px;height:72px;background-color:${brand.greenLight};border-radius:50%;line-height:72px;font-size:32px;">🎉</div>
    </div>

    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">Thank you for your order!</h1>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
      Hi <strong style="color:${brand.textDark};">${firstName}</strong> — your order has been received and is being processed. We'll keep you updated every step of the way.
    </p>

    ${buildInfoBox(`Your Order Number is <strong style="font-size:16px;">${order.orderNumber}</strong>. Keep this handy to track your order.`, 'success')}

    <!-- Order Items Table -->
    ${buildSectionHeading('Order Summary')}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${brand.border};border-radius:10px;overflow:hidden;margin-bottom:8px;">
      <thead>
        <tr style="background-color:${brand.offWhite};">
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Item</th>
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</th>
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
      <tfoot style="background-color:${brand.offWhite};">
        <tr>
          <td colspan="2" style="padding:12px 16px;font-size:14px;color:${brand.textMid};border-top:1px solid ${brand.border};text-align:right;">Subtotal</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;color:${brand.textDark};border-top:1px solid ${brand.border};text-align:right;">R${formatPrice(order.subtotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:12px 16px;font-size:14px;color:${brand.textMid};text-align:right;">Shipping</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;color:${brand.textDark};text-align:right;">${order.shipping === 0 ? '<span style="color:' + brand.greenDark + ';">FREE</span>' : `R${formatPrice(order.shipping)}`}</td>
        </tr>
        <tr style="background-color:${brand.charcoal};">
          <td colspan="2" style="padding:14px 16px;font-size:16px;font-weight:700;color:${brand.white};text-align:right;">Total</td>
          <td style="padding:14px 16px;font-size:18px;font-weight:800;color:${brand.green};text-align:right;">R${formatPrice(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Details Grid -->
    <div style="margin-top:32px;display:flex;gap:24px;">
      <div style="flex:1;min-width:0;">
        ${buildSectionHeading('Customer Details')}
        ${buildDetailsTable([
    buildInfoRow('Name', order.customerName),
    buildInfoRow('Email', order.customerEmail),
    buildInfoRow('Phone', order.customerPhone),
  ].join(''))}
      </div>
    </div>

    ${buildSectionHeading('Delivery Address')}
    ${buildDetailsTable([
    buildInfoRow('Street', order.customerAddress.street),
    buildInfoRow('City', order.customerAddress.city),
    buildInfoRow('Province', order.customerAddress.province),
    buildInfoRow('Postal Code', order.customerAddress.postalCode),
  ].join(''))}

    <!-- Track Order CTA -->
    <div style="text-align:center;margin-top:40px;">
      ${buildButton('Track My Order', `${SITE_URL}/order/track?q=${order.orderNumber}`)}
    </div>

    ${buildInfoBox('Questions about your order? Reply to this email or call us on <strong>011 693 2600</strong>.', 'info')}
  `;
}

function generateStatusUpdateBody(order: Order): string {
  const statusConfig: Record<string, { title: string; message: string; color: string; emoji: string }> = {
    paid: {
      title: 'Payment Confirmed',
      message: 'Your payment has been successfully processed. Our team is now preparing your order for production.',
      color: brand.blue,
      emoji: '💳',
    },
    processing: {
      title: 'In Production',
      message: 'Your order has moved into production. Our team is working hard on your signage.',
      color: brand.purple,
      emoji: '⚙️',
    },
    shipped: {
      title: 'Order Shipped',
      message: 'Great news — your order has been dispatched and is on its way to you!',
      color: brand.emerald,
      emoji: '🚚',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If this was unexpected, please contact us immediately.',
      color: brand.red,
      emoji: '❌',
    },
  };

  const info = statusConfig[order.status] || {
    title: 'Status Updated',
    message: `Your order status has been updated to: ${order.status}.`,
    color: brand.textMuted,
    emoji: '📋',
  };

  const firstName = order.customerName.split(' ')[0];

  return `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:72px;height:72px;border-radius:50%;line-height:72px;font-size:32px;background-color:${brand.offWhite};">${info.emoji}</div>
    </div>

    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${brand.textDark};text-align:center;">${info.title}</h1>
    <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#6b7280;text-align:center;">
      Hi <strong style="color:${brand.textDark};">${firstName}</strong> — ${info.message}
    </p>

    <!-- Status Badge -->
    <div style="text-align:center;margin:24px 0 32px;">
      <div style="display:inline-block;background-color:${info.color};color:#fff;font-size:14px;font-weight:700;padding:10px 28px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;">${order.status.replace(/_/g, ' ')}</div>
    </div>

    ${buildSectionHeading('Order Details')}
    ${buildDetailsTable([
    buildInfoRow('Order Number', `<strong>${order.orderNumber}</strong>`),
    buildInfoRow('Updated', new Date(order.updatedAt).toLocaleString('en-ZA')),
    buildInfoRow('Current Status', `<strong style="color:${info.color};text-transform:uppercase;">${order.status}</strong>`),
  ].join(''))}

    <div style="text-align:center;margin-top:40px;">
      ${buildButton('View Order Details', `${SITE_URL}/order/track?q=${order.orderNumber}`)}
    </div>
  `;
}

function generateAdminNotificationBody(order: Order): string {
  const itemsRows = order.items.map(item => `
    <tr>
      <td style="padding:14px 16px;font-size:14px;color:${brand.textDark};border-bottom:1px solid ${brand.border};">
        <strong>${item.name}</strong>
        <span style="font-size:12px;color:${brand.textMuted};margin-left:8px;">(${item.size})</span>
      </td>
      <td style="padding:14px 16px;font-size:14px;color:${brand.textMid};text-align:center;border-bottom:1px solid ${brand.border};">${item.quantity}</td>
      <td style="padding:14px 16px;font-size:14px;font-weight:600;color:${brand.textDark};text-align:right;border-bottom:1px solid ${brand.border};">R${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${brand.textDark};">🛒 New Order Received</h1>
    <p style="margin:0 0 32px;font-size:15px;color:${brand.textMuted};">A new order has been placed on the Aloe Signs website.</p>

    ${buildSectionHeading('Order Info')}
    ${buildDetailsTable([
    buildInfoRow('Order Number', `<strong>${order.orderNumber}</strong>`),
    buildInfoRow('Date', new Date(order.createdAt).toLocaleString('en-ZA')),
    buildInfoRow('Status', order.status.toUpperCase()),
    buildInfoRow('Payment', order.paymentStatus.toUpperCase()),
    buildInfoRow('Total', `<strong style="font-size:16px;color:${brand.green};">R${formatPrice(order.total)}</strong>`),
  ].join(''))}

    ${buildSectionHeading('Customer')}
    ${buildDetailsTable([
    buildInfoRow('Name', order.customerName),
    buildInfoRow('Email', `<a href="mailto:${order.customerEmail}" style="color:${brand.green};text-decoration:none;">${order.customerEmail}</a>`),
    buildInfoRow('Phone', `<a href="tel:${order.customerPhone}" style="color:${brand.green};text-decoration:none;">${order.customerPhone}</a>`),
    buildInfoRow('Address', `${order.customerAddress.street}, ${order.customerAddress.city}, ${order.customerAddress.province} ${order.customerAddress.postalCode}`),
  ].join(''))}

    ${buildSectionHeading('Items Ordered')}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${brand.border};border-radius:10px;overflow:hidden;margin-bottom:8px;">
      <thead>
        <tr style="background-color:${brand.offWhite};">
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Item</th>
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</th>
          <th style="padding:12px 16px;font-size:12px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
      <tfoot style="background-color:${brand.charcoal};">
        <tr>
          <td colspan="2" style="padding:14px 16px;font-size:16px;font-weight:700;color:${brand.white};text-align:right;">Total</td>
          <td style="padding:14px 16px;font-size:18px;font-weight:800;color:${brand.green};text-align:right;">R${formatPrice(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align:center;margin-top:40px;">
      ${buildButton('Manage Order', `${SITE_URL}/admin/orders/${order.id}`)}
    </div>
  `;
}

// ─── Plain Text Fallbacks ─────────────────────────────────────────────────────

function generateOrderConfirmationText(order: Order): string {
  return `ORDER CONFIRMATION\n\nOrder #${order.orderNumber}\n\nHi ${order.customerName},\nThank you for your order!\n\nITEMS:\n${order.items.map(i => `${i.name} x${i.quantity} (R${formatPrice(i.price * i.quantity)})`).join('\n')}\n\nSubtotal: R${formatPrice(order.subtotal)}\nShipping: ${order.shipping === 0 ? 'FREE' : `R${formatPrice(order.shipping)}`}\nTotal: R${formatPrice(order.total)}\n\nTrack your order: ${SITE_URL}/order/track?q=${order.orderNumber}`;
}

function generateStatusUpdateText(order: Order, previousStatus: string): string {
  return `ORDER UPDATE\n\nOrder #${order.orderNumber}\nStatus: ${order.status.toUpperCase()}\n\nHi ${order.customerName},\nYour order status has been updated from ${previousStatus} to ${order.status}.\n\nTrack here: ${SITE_URL}/order/track?q=${order.orderNumber}`;
}

function generateAdminNotificationText(order: Order): string {
  return `NEW ORDER\n\nOrder #${order.orderNumber}\nCustomer: ${order.customerName} (${order.customerEmail})\nTotal: R${formatPrice(order.total)}\n\nManage here: ${SITE_URL}/admin/orders/${order.id}`;
}
