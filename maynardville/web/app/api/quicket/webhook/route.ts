import { recordWebhookSale } from "@/lib/quicket-sync";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.QUICKET_WEBHOOK_SECRET;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    // If body is invalid JSON, still acknowledge so Quicket doesn't retry-storm.
    return NextResponse.json({ ok: false, error: "Invalid JSON" });
  }

  try {
    const recorded = await recordWebhookSale(payload);
    return NextResponse.json({ ok: true, recorded });
  } catch (e) {
    // Log error but still return 200 — Quicket webhooks are not cryptographically signed;
    // the shared ?token= parameter is the only guard.
    console.error("Webhook processing error:", e);
    return NextResponse.json({ ok: false });
  }
}