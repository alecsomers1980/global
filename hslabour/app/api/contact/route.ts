import { NextResponse } from "next/server";

interface ContactFormData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  website?: string; // honeypot
}

// Simple in-memory rate limit (best-effort; per server instance).
const RATE_LIMIT = 5; // requests
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: ContactFormData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { name, email, service, message, website } = body;

  // Honeypot: silently accept (so bots don't learn) but do nothing.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "Name is required." },
      { status: 400 }
    );
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required." },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "Message is required." },
      { status: 400 }
    );
  }

  // TODO: wire email (Resend). Avoid logging PII — record a redacted event only.
  console.log("[lead] received", {
    service: service?.trim() || "General enquiry",
    emailDomain: email.trim().split("@")[1] ?? "unknown",
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}