import { NextResponse } from "next/server";

interface ContactFormData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}

export async function POST(req: Request) {
  let body: ContactFormData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { name, company, email, phone, service, message } = body;

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

  // TODO: wire email (Resend) — currently logs only
  console.log("[lead]", {
    name: name.trim(),
    company: company?.trim() ?? null,
    email: email.trim(),
    phone: phone?.trim() ?? null,
    service: service?.trim() ?? "General enquiry",
    message: message.trim(),
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}