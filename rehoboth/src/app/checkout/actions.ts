"use server";

import { createOrder, attachCheckout, CheckoutError, type CheckoutLine } from "@/lib/orders";
import { createCheckout, getYocoSettings, YocoError } from "@/lib/yoco";
import { isBot } from "@/lib/bot-guard";

export type CheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3010")
  );
}

/**
 * Turn a basket into a pending order and hand back the Yoco page to send the
 * customer to.
 *
 * Only variant ids and quantities cross this boundary. Prices, shipping and
 * the total are all computed server-side in createOrder — see the note there.
 * The amount Yoco is asked for comes from that computed total, never from
 * anything the browser sent.
 */
export async function startCheckout(form: FormData): Promise<CheckoutResult> {
  if (isBot({ company: form.get("company"), renderedAt: form.get("renderedAt") })) {
    // Look like success and do nothing. Telling a bot why it failed just
    // teaches it what to send next time.
    return { ok: true, redirectUrl: "/checkout/success" };
  }

  let lines: CheckoutLine[];
  try {
    lines = JSON.parse(String(form.get("lines") ?? "[]"));
  } catch {
    return { ok: false, error: "We could not read your basket. Please try again." };
  }

  const collectFromFarm = form.get("delivery") === "collect";
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "Please give us your name and email address." };
  }

  // Checked before the order row is written: a missing key means no payment
  // page exists to send anyone to, and a pending order nobody can pay is just
  // a row that has to be cleaned up later.
  const { secret_key } = await getYocoSettings();
  if (!secret_key) {
    console.error("[checkout] Yoco is not configured — no secret key in site_settings");
    return {
      ok: false,
      error: "Our online payments are not live yet. Please call 082 824 9023 to order.",
    };
  }

  try {
    const order = await createOrder({
      name,
      email,
      phone: String(form.get("phone") ?? ""),
      collectFromFarm,
      shipLine1: String(form.get("line1") ?? ""),
      shipCity: String(form.get("city") ?? ""),
      shipProvince: String(form.get("province") ?? ""),
      shipPostcode: String(form.get("postcode") ?? ""),
      lines,
    });

    const checkout = await createCheckout({
      secretKey: secret_key,
      orderId: order.orderId,
      reference: order.reference,
      total: order.total,
      siteUrl: siteUrl(),
    });

    await attachCheckout(order.orderId, checkout.id);

    return { ok: true, redirectUrl: checkout.redirectUrl };
  } catch (e) {
    if (e instanceof CheckoutError) {
      if (e.code === "not_configured") {
        console.error("[checkout] Supabase is not configured — cannot take orders");
        return { ok: false, error: "Our online checkout is not live yet. Please call 082 824 9023." };
      }
      return { ok: false, error: e.message };
    }
    if (e instanceof YocoError) {
      // The order exists and is pending; it simply has no payment page. The
      // detail is in the log — a rejected key or a malformed amount is not
      // something a customer can act on.
      console.error("[checkout] Yoco refused the checkout", e);
      return {
        ok: false,
        error: "We could not reach our payment provider. Please try again in a moment.",
      };
    }
    console.error("[checkout] failed", e);
    return { ok: false, error: "Something went wrong on our side. Please try again." };
  }
}
