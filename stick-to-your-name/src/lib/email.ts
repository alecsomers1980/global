'use server'; // not strictly needed but we'll keep it server-only

import { Resend } from 'resend';

// Minimal inline type to avoid importing Orders from db
type OrderLike = {
  id: string;
  customer_email: string;
  customer_name?: string;
  child_name?: string;
  design_name?: string;
  amount_cents?: number;
  status?: string;
};

type ContactMessage = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

// Lazily construct Resend client only when API key is present
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM;
const ADMIN = process.env.EMAIL_ADMIN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Helper to guard missing essential env vars
function canSend(): boolean {
  return Boolean(FROM && ADMIN && process.env.RESEND_API_KEY);
}

// Friendly status labels used in emails
const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Confirmed & Paid',
  printing: 'Printing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Payment Failed',
};

export async function sendOrderStatusEmail(order: OrderLike, newStatus: string): Promise<void> {
  try {
    const resend = getResend();
    if (!resend || !canSend()) {
      console.log('Resend not configured, skipping order status email.');
      return;
    }

    const to = order.customer_email;
    if (!to) return;

    const childName = order.child_name || 'your child';
    const designName = order.design_name || 'your design';
    const shortId = order.id.slice(0, 8).toUpperCase();
    const label = statusLabels[newStatus] || newStatus;
    const subject = `Your order ${shortId} is now "${label}"`;

    let bodyHtml = `<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">`;
    bodyHtml += `<h1 style="color:#ec4899; margin-top:0;">Stick to Your Name</h1>`;
    bodyHtml += `<p>Hi ${order.customer_name || ''},</p>`;
    bodyHtml += `<p>Your order <strong>${shortId}</strong> for <strong>${childName}</strong> (design: ${designName}) has been updated to <span style="color:#ec4899; font-weight:bold;">${label}</span>.</p>`;

    // Extra context per status
    if (newStatus === 'paid') {
      bodyHtml += `<p>We’ve received your payment and will start preparing your order. You’ll get another email when it ships.</p>`;
    } else if (newStatus === 'shipped') {
      bodyHtml += `<p>Your item is on its way! If you have any questions, just reply to this email.</p>`;
    } else if (newStatus === 'completed') {
      bodyHtml += `<p>We hope you love it! Feel free to share a picture and tag us.</p>`;
    } else if (newStatus === 'printing') {
      bodyHtml += `<p>We’re busy creating your item with care. It shouldn’t take long!</p>`;
    } else if (newStatus === 'cancelled') {
      bodyHtml += `<p>Your order has been cancelled. If you didn’t request this, please contact us immediately.</p>`;
    } else if (newStatus === 'failed') {
      bodyHtml += `<p>Unfortunately your payment didn’t go through. You can try placing a new order or contact us for help.</p>`;
    }

    bodyHtml += `<p style="margin-top:24px;">Warmly,<br/>The Aloe Signs Team</p>`;
    bodyHtml += `<hr style="border:1px solid #f3f4f6; margin:20px 0;" />`;
    bodyHtml += `<p style="font-size:12px; color:#6b7280;">Order #${shortId} · <a href="${SITE_URL}" style="color:#ec4899;">${SITE_URL}</a></p>`;
    bodyHtml += `</div>`;

    await resend.emails.send({
      from: FROM!,
      to,
      subject,
      html: bodyHtml,
    });
  } catch (error) {
    console.error('sendOrderStatusEmail failed:', error);
  }
}

export async function sendContactNotification(msg: ContactMessage): Promise<void> {
  try {
    const resend = getResend();
    if (!resend || !canSend()) {
      console.log('Resend not configured, skipping contact notification.');
      return;
    }

    const subject = `New contact message from ${msg.name}`;
    let bodyHtml = `<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">`;
    bodyHtml += `<h2 style="color:#ec4899;">New Contact Enquiry</h2>`;
    bodyHtml += `<p><strong>Name:</strong> ${msg.name}</p>`;
    bodyHtml += `<p><strong>Email:</strong> <a href="mailto:${msg.email}" style="color:#ec4899;">${msg.email}</a></p>`;
    if (msg.phone) bodyHtml += `<p><strong>Phone:</strong> ${msg.phone}</p>`;
    bodyHtml += `<p><strong>Message:</strong></p>`;
    bodyHtml += `<p style="background:#f9fafb; padding:12px; border-radius:8px; border-left:4px solid #ec4899;">${msg.message.replace(/\n/g, '<br/>')}</p>`;
    bodyHtml += `<p style="margin-top:24px; font-size:12px;">Reply directly to this email to contact ${msg.name}.</p>`;
    bodyHtml += `</div>`;

    await resend.emails.send({
      from: FROM!,
      to: ADMIN!,
      replyTo: msg.email,
      subject,
      html: bodyHtml,
    });
  } catch (error) {
    console.error('sendContactNotification failed:', error);
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  try {
    const resend = getResend();
    if (!resend || !canSend()) {
      console.log('Resend not configured, skipping password reset email.');
      return;
    }

    const subject = 'Reset your admin password';
    let bodyHtml = `<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">`;
    bodyHtml += `<h1 style="color:#ec4899;">Stick to Your Name Admin</h1>`;
    bodyHtml += `<p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>`;
    bodyHtml += `<p style="text-align:center; margin:30px 0;">`;
    bodyHtml += `<a href="${resetUrl}" style="display:inline-block; background:#ec4899; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Reset password</a>`;
    bodyHtml += `</p>`;
    bodyHtml += `<p>If you didn’t request this, you can safely ignore this email.</p>`;
    bodyHtml += `<p style="font-size:12px; color:#6b7280; margin-top:20px;">${SITE_URL}</p>`;
    bodyHtml += `</div>`;

    await resend.emails.send({
      from: FROM!,
      to: toEmail,
      subject,
      html: bodyHtml,
    });
  } catch (error) {
    console.error('sendPasswordResetEmail failed:', error);
  }
}

export async function sendNewOrderEmail(order: OrderLike): Promise<void> {
  try {
    const resend = getResend();
    if (!resend || !canSend()) {
      console.log('Resend not configured, skipping new order admin email.');
      return;
    }

    const childName = order.child_name || 'N/A';
    const shortId = order.id.slice(0, 8).toUpperCase();
    const amount = order.amount_cents ? `R ${(order.amount_cents / 100).toFixed(2)}` : 'N/A';
    const design = order.design_name || 'N/A';

    const subject = `New paid order — ${childName}`;

    let bodyHtml = `<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">`;
    bodyHtml += `<h2 style="color:#ec4899;">New Order Received</h2>`;
    bodyHtml += `<p>A new order has been marked as paid.</p>`;
    bodyHtml += `<table style="width:100%; border-collapse:collapse; margin:24px 0;">
      <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;"><strong>Order ID</strong></td><td style="border-bottom:1px solid #f3f4f6;">#${shortId}</td></tr>
      <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;"><strong>Child Name</strong></td><td style="border-bottom:1px solid #f3f4f6;">${childName}</td></tr>
      <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;"><strong>Design</strong></td><td style="border-bottom:1px solid #f3f4f6;">${design}</td></tr>
      <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;"><strong>Amount</strong></td><td style="border-bottom:1px solid #f3f4f6;">${amount}</td></tr>
      ${order.customer_email ? `<tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;"><strong>Customer Email</strong></td><td style="border-bottom:1px solid #f3f4f6;">${order.customer_email}</td></tr>` : ''}
    </table>`;
    bodyHtml += `<p><a href="${SITE_URL}/admin" style="color:#ec4899;">View order in admin panel</a></p>`;
    bodyHtml += `</div>`;

    await resend.emails.send({
      from: FROM!,
      to: ADMIN!,
      subject,
      html: bodyHtml,
    });
  } catch (error) {
    console.error('sendNewOrderEmail failed:', error);
  }
}