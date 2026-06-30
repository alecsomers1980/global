import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

// Best-effort in-memory rate limiter (per-instance, not suitable for multi-instance/serverless)
const hits = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

const MAX_FIELDS = {
  name: 120,
  email: 160,
  phone: 40,
  suburb: 120,
  serviceType: 80,
  message: 4000,
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Internal server configuration error" },
      { status: 500 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const timestamps = hits.get(ip) || [];
  const recent = timestamps.filter((t) => t > now - WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, [...recent, now]);
    return NextResponse.json(
      { error: "Too many requests, please try again shortly." },
      { status: 429 }
    );
  }
  recent.push(now);
  hits.set(ip, recent);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, phone, suburb, serviceType, message } = body || {};

  // Required fields
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  // Max lengths
  if (name.length > MAX_FIELDS.name) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (email.length > MAX_FIELDS.email) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (phone.length > MAX_FIELDS.phone) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (suburb && typeof suburb === "string" && suburb.length > MAX_FIELDS.suburb) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (serviceType && typeof serviceType === "string" && serviceType.length > MAX_FIELDS.serviceType) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (message && typeof message === "string" && message.length > MAX_FIELDS.message) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  // Sanitise for HTML email
  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safePhone = escapeHtml(phone.trim());
  const safeSuburb = escapeHtml((suburb as string)?.trim() || "");
  const safeServiceType = escapeHtml((serviceType as string)?.trim() || "");
  const safeMessage = escapeHtml((message as string)?.trim() || "");

  const html = `
    <h2>New Quote Request</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
      <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
      <tr><td><strong>Suburb</strong></td><td>${safeSuburb || "(not provided)"}</td></tr>
      <tr><td><strong>Service</strong></td><td>${safeServiceType || "(not provided)"}</td></tr>
      <tr><td><strong>Message</strong></td><td>${safeMessage || "(not provided)"}</td></tr>
    </table>
  `;

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from:
        process.env.QUOTE_FROM_EMAIL ||
        "East Lake Drilling <onboarding@resend.dev>",
      to: process.env.QUOTE_TO_EMAIL || "info@eastlakedrilling.co.za",
      subject: `New quote request from ${name.trim()}`,
      replyTo: email.trim(),
      html,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}