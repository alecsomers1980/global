import nodemailer from 'nodemailer';
import { Order } from './orders';
import { formatPrice } from './utils';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Create reusable transporter
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Styles
const colors = {
  primary: '#84cc16', // Aloe Green
  secondary: '#2d2d2d', // Charcoal
  bg: '#f3f4f6', // Light Grey
  white: '#ffffff',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb'
};

const styles = {
  body: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: ${colors.text}; background-color: ${colors.bg}; margin: 0; padding: 0;`,
  container: `max-width: 600px; margin: 0 auto; background-color: ${colors.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);`,
  header: `background-color: ${colors.secondary}; padding: 30px; text-align: center;`,
  logo: `font-size: 28px; font-weight: bold; color: ${colors.primary}; text-decoration: none; display: inline-block; letter-spacing: 1px;`,
  content: `padding: 40px 30px;`,
  h1: `color: ${colors.secondary}; font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px;`,
  h2: `color: ${colors.secondary}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid ${colors.primary}; padding-bottom: 5px; display: inline-block;`,
  p: `margin-bottom: 15px; font-size: 16px;`,
  table: `width: 100%; border-collapse: collapse; margin-top: 10px;`,
  th: `text-align: left; padding: 12px; background-color: ${colors.bg}; font-weight: bold; font-size: 14px; text-transform: uppercase; color: ${colors.muted};`,
  td: `padding: 12px; border-bottom: 1px solid ${colors.border}; vertical-align: top;`,
  totalRow: `font-weight: bold; font-size: 18px; color: ${colors.secondary};`,
  button: `display: inline-block; background-color: ${colors.primary}; color: ${colors.secondary}; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; margin-top: 20px;`,
  footer: `background-color: ${colors.secondary}; color: ${colors.muted}; padding: 30px; text-align: center; font-size: 14px;`,
  link: `color: ${colors.primary}; text-decoration: none;`,
  trackingBox: `background-color: ${colors.bg}; border-left: 4px solid ${colors.primary}; padding: 20px; border-radius: 4px; margin: 25px 0;`
};

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const emailHtml = generateOrderConfirmationHTML(order);
  const emailText = generateOrderConfirmationText(order);

  try {
    await transporter.sendMail({
      from: `"Aloe Signs" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(
  order: Order,
  previousStatus: string
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const emailHtml = generateStatusUpdateHTML(order, previousStatus);
  const emailText = generateStatusUpdateText(order, previousStatus);

  try {
    await transporter.sendMail({
      from: `"Aloe Signs" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Update - ${order.orderNumber}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Status update email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return false;
  }
}

/**
 * Send order notification to admin
 */
export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_EMAIL || 'alec@firewireit.co.za';
  if (!adminEmail) return false;

  const emailHtml = generateAdminNotificationHTML(order);
  const emailText = generateAdminNotificationText(order);

  try {
    await transporter.sendMail({
      from: `"Aloe Signs Website" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Order Received - ${order.orderNumber}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

// --- HTML Generators ---

function generateOrderConfirmationHTML(order: Order): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="${styles.td}">
        <div style="font-weight: bold; color: ${colors.secondary};">${item.name}</div>
        <div style="font-size: 13px; color: ${colors.muted};">${item.size}</div>
      </td>
      <td style="${styles.td} text-align: center;">${item.quantity}</td>
      <td style="${styles.td} text-align: right;">R${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="${styles.body}"> 
  <div style="padding: 20px;">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}" style="${styles.logo}">ALOE SIGNS</a>
      </div>
      
      <div style="${styles.content}">
        <h1 style="${styles.h1}">Thank you for your order!</h1>
        <p style="${styles.p}">Hi ${order.customerName},</p>
        <p style="${styles.p}">We've received your order and it is currently being processed. Here are the details of your purchase.</p>

        <div style="${styles.trackingBox}">
          <h3 style="margin-top: 0; color: ${colors.secondary}; font-size: 16px;">🚚 Track Your Order</h3>
          <p style="margin-bottom: 10px; font-size: 14px;">Follow these steps to check your order status:</p>
          <ol style="padding-left: 20px; font-size: 14px; margin-bottom: 0;">
            <li>Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/track" style="${styles.link}">Aloe Signs</a></li>
            <li>Click on <strong>Track Order</strong> in the menu</li>
            <li>Enter your Order Number: <strong>${order.orderNumber}</strong></li>
          </ol>
        </div>

        <h2 style="${styles.h2}">Order Summary</h2>
        <table style="${styles.table}">
          <thead>
            <tr>
              <th style="${styles.th}">Item</th>
              <th style="${styles.th} text-align: center;">Qty</th>
              <th style="${styles.th} text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
             <tr>
              <td colspan="2" style="${styles.td} font-weight: bold; border-top: 2px solid ${colors.border}; text-align: right;">Subtotal</td>
              <td style="${styles.td} font-weight: bold; border-top: 2px solid ${colors.border}; text-align: right;">R${formatPrice(order.subtotal)}</td>
            </tr>
            <tr>
              <td colspan="2" style="${styles.td} font-weight: bold; text-align: right;">Shipping</td>
              <td style="${styles.td} font-weight: bold; text-align: right;">${order.shipping === 0 ? 'FREE' : `R${formatPrice(order.shipping)}`}</td>
            </tr>
             <tr>
              <td colspan="2" style="${styles.td} border-top: 2px solid ${colors.secondary}; text-align: right; color: ${colors.secondary}; font-size: 20px; font-weight: bold;">Total</td>
              <td style="${styles.td} border-top: 2px solid ${colors.secondary}; text-align: right; color: ${colors.secondary}; font-size: 20px; font-weight: bold;">R${formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; display: flex; flex-wrap: wrap; gap: 30px;">
          <div style="flex: 1; min-width: 200px;">
             <h2 style="${styles.h2}">Customer Details</h2>
             <p style="margin: 0; font-size: 14px;">
               <strong>${order.customerName}</strong><br>
               ${order.customerEmail}<br>
               ${order.customerPhone}
             </p>
          </div>
          <div style="flex: 1; min-width: 200px;">
             <h2 style="${styles.h2}">Delivery Address</h2>
             <p style="margin: 0; font-size: 14px;">
               ${order.customerAddress.street}<br>
               ${order.customerAddress.city}, ${order.customerAddress.province}<br>
               ${order.customerAddress.postalCode}
             </p>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/track?q=${order.orderNumber}" style="${styles.button}">Track Order Status</a>
        </div>
      </div>

      <div style="${styles.footer}">
        <p style="margin: 0;">Aloe Signs - Products that builds businesses.</p>
        <p style="margin: 10px 0;">
          <a href="mailto:team@aloesigns.co.za" style="${styles.link}">team@aloesigns.co.za</a> | 011 693 2600
        </p>
        <p style="margin: 0; opacity: 0.7; font-size: 12px;">© ${new Date().getFullYear()} Aloe Signs. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateStatusUpdateHTML(order: Order, previousStatus: string): string {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    paid: {
      title: 'Payment Confirmed',
      message: 'Your payment has been successfully processed. We are now preparing your order for production.',
      color: '#3b82f6',
    },
    processing: {
      title: 'Order In Production',
      message: 'Your order has been moved to production. Our team is working on your items.',
      color: '#8b5cf6',
    },
    shipped: {
      title: 'Order Shipped',
      message: 'Great news! Your order has been dispatched and is on its way to you.',
      color: '#10b981',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If this was a mistake, please contact us immediately.',
      color: '#ef4444',
    },
  };

  const statusInfo = statusMessages[order.status] || {
    title: 'Status Updated',
    message: `Your order status has been updated to: ${order.status}`,
    color: '#6b7280',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="${styles.body}">
  <div style="padding: 20px;">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za'}" style="${styles.logo}">ALOE SIGNS</a>
      </div>
      
      <div style="${styles.content}">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 10px 20px; border-radius: 50px; background-color: ${statusInfo.color}; color: white; font-weight: bold; font-size: 18px;">
            ${statusInfo.title}
          </div>
        </div>

        <p style="${styles.p}">Hi ${order.customerName},</p>
        <p style="${styles.p}">${statusInfo.message}</p>

        <div style="${styles.trackingBox}">
          <p style="margin: 0; font-weight: bold;">
            Current Status: <span style="color: ${statusInfo.color}; text-transform: uppercase;">${order.status}</span>
          </p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: ${colors.muted};">
            Updated: ${new Date(order.updatedAt).toLocaleString('en-ZA')}
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/track?q=${order.orderNumber}" style="${styles.button}">View Order Details</a>
        </div>
      </div>

      <div style="${styles.footer}">
        <p style="margin: 0;">Aloe Signs - Products that builds businesses.</p>
        <p style="margin: 10px 0;">
          <a href="mailto:team@aloesigns.co.za" style="${styles.link}">team@aloesigns.co.za</a> | 011 693 2600
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAdminNotificationHTML(order: Order): string {
  const itemsHTML = order.items.map(item => `
        <tr>
          <td style="${styles.td}">
            <strong>${item.name}</strong> <span style="color: ${colors.muted}; font-size: 12px;">(${item.size})</span>
          </td>
          <td style="${styles.td} text-align: center;">${item.quantity}</td>
          <td style="${styles.td} text-align: right;">R${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order</title>
</head>
<body style="${styles.body}">
  <div style="padding: 20px;">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <span style="${styles.logo}">ALOE ADMIN</span>
      </div>
      
      <div style="${styles.content}">
        <h1 style="${styles.h1}">New Order Received</h1>
        <div style="background-color: ${colors.bg}; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold; font-size: 18px;">Order #${order.orderNumber}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: ${colors.muted};">${new Date(order.createdAt).toLocaleString('en-ZA')}</p>
            <p style="margin: 10px 0 0 0;">
                Status: <strong>${order.status.toUpperCase()}</strong> | 
                Payment: <strong>${order.paymentStatus.toUpperCase()}</strong>
            </p>
        </div>

        <h2 style="${styles.h2}">Customer</h2>
        <p style="margin: 0;">
            <strong>${order.customerName}</strong><br>
            <a href="mailto:${order.customerEmail}" style="${styles.link}">${order.customerEmail}</a><br>
            <a href="tel:${order.customerPhone}" style="${styles.link}">${order.customerPhone}</a>
        </p>

        <h2 style="${styles.h2}">Items</h2>
        <table style="${styles.table}">
            ${itemsHTML}
            <tr>
              <td colspan="2" style="${styles.td} font-weight: bold; text-align: right; border-top: 2px solid ${colors.secondary};">Total</td>
              <td style="${styles.td} font-weight: bold; text-align: right; border-top: 2px solid ${colors.secondary};">R${formatPrice(order.total)}</td>
            </tr>
        </table>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}" style="${styles.button}">Manage Order</a>
        </div>
      </div>
      
      <div style="${styles.footer}">
        <p>System Notification for Aloe Signs Admin.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// --- Text Generators ---

function generateOrderConfirmationText(order: Order): string {
  return `ORDER CONFIRMATION\n\nOrder #${order.orderNumber}\n\nHi ${order.customerName},\nThank you for your order!\n\nTRACKING STEPS:\n1. Visit ${process.env.NEXT_PUBLIC_SITE_URL}/order/track\n2. Enter Order Number: ${order.orderNumber}\n\nITEMS:\n${order.items.map(i => `${i.name} x${i.quantity} (R${i.price * i.quantity})`).join('\n')}\n\nTotal: R${order.total}\n\nAccess your tracking here: ${process.env.NEXT_PUBLIC_SITE_URL}/order/track?q=${order.orderNumber}`;
}

function generateStatusUpdateText(order: Order, previousStatus: string): string {
  return `ORDER UPDATE\n\nOrder #${order.orderNumber}\nStatus: ${order.status.toUpperCase()}\n\nHi ${order.customerName},\nYour order status has been updated.\n\nTrack here: ${process.env.NEXT_PUBLIC_SITE_URL}/order/track?q=${order.orderNumber}`;
}

function generateAdminNotificationText(order: Order): string {
  return `NEW ORDER\n\nOrder #${order.orderNumber}\nCustomer: ${order.customerName} (${order.customerEmail})\nTotal: R${order.total}\n\nManage here: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
}
