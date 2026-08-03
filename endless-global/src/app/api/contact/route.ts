import { NextResponse } from "next/server";

// Contact form handler.
// Currently validates + logs the submission and returns success. To deliver email,
// wire an email provider (e.g. Resend) here using an env-stored API key.
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const name = String(data?.name ?? "").trim();
    const email = String(data?.email ?? "").trim();
    const service = String(data?.service ?? "").trim();

    if (!name || !email || !service) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // eslint-disable-next-line no-console
    console.log("[contact] new enquiry:", {
      name,
      email,
      phone: data?.phone ?? "",
      country: data?.country ?? "",
      company: data?.company ?? "",
      service,
      message: data?.message ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
