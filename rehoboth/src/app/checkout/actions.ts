"use server";

import { createOrder, CheckoutError, type CheckoutLine } from "@/lib/orders";
import { payfast } from "@/lib/payfast";
import { isBot } from "@/lib/bot-guard";

export type CheckoutResult =
  | { ok: true; action: string; fields: Record<string, string> }
  | { ok: false; error: string };

/**
 * Turn a basket into a pending order and hand back the signed field set the
 * browser POSTs to PayFast.
 *
 * Only variant ids and quantities cross this boundary. Prices, shipping and
 * the total are all computed server-side in createOrder — see the note there.
 */
export async function startCheckout(form: FormData): Promise<CheckoutResult> {
  if (isBot({ company: form.get("company"), renderedAt: form.get("renderedAt") })) {
    // Look like success and do nothing. Telling a bot why it failed just
    // teaches it what to send next time.
    return { ok: true, action: "/checkout/success", fields: {} };
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

    const [first, ...rest] = name.split(/\s+/);
    const fields = payfast.createPaymentData({
      orderId: order.orderId,
      amount: order.total,
      customerFirstName: first,
      customerLastName: rest.join(" ") || first,
      customerEmail: email,
      customerPhone: String(form.get("phone") ?? "") || undefined,
      itemName: `Rehoboth order ${order.reference}`,
    });

    return { ok: true, action: payfast.getPaymentUrl(), fields };
  } catch (e) {
    if (e instanceof CheckoutError) {
      if (e.code === "not_configured") {
        console.error("[checkout] Supabase is not configured — cannot take orders");
        return { ok: false, error: "Our online checkout is not live yet. Please call 082 824 9023." };
      }
      return { ok: false, error: e.message };
    }
    console.error("[checkout] failed", e);
    return { ok: false, error: "Something went wrong on our side. Please try again." };
  }
}
