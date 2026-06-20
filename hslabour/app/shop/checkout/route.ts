import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductById } from "@/lib/shop";
import { buildCheckout } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const productId = String(form.get("product_id") ?? "");
  const buyer_name = String(form.get("buyer_name") ?? "").trim();
  const buyer_email = String(form.get("buyer_email") ?? "").trim();
  const brief = String(form.get("brief") ?? "").trim();
  const consent = form.get("consent") != null;

  if (!productId || !buyer_email) {
    return new Response("Missing details", { status: 400 });
  }

  const product = await getProductById(productId);
  const purchasable =
    !!product &&
    product.is_active &&
    product.price_cents > 0 &&
    (product.kind === "service" || !!product.file_path);

  if (!product || !purchasable) {
    return new Response("Product not available", { status: 400 });
  }

  if (product.requires_consent && !consent) {
    return new Response("Consent is required", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("shop_orders")
    .insert({
      product_id: product.id,
      product_name: product.name,
      buyer_email,
      buyer_name: buyer_name || null,
      brief: brief || null,
      amount_cents: product.price_cents,
      status: "pending",
      consent_at: consent ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !order) {
    return new Response("Could not start checkout", { status: 500 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const { processUrl, fields } = buildCheckout({
    amountCents: product.price_cents,
    itemName: product.name,
    mPaymentId: order.id,
    buyerEmail: buyer_email,
    buyerName: buyer_name,
    returnUrl: `${siteUrl}/shop/success?order=${order.id}`,
    cancelUrl: `${siteUrl}/shop/${product.slug}?cancelled=1`,
    notifyUrl: `${siteUrl}/api/payfast/shop-notify`,
  });

  const inputs = fields
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${k}" value="${v.replace(/"/g, "&quot;")}" />`
    )
    .join("");

  const html = `<!doctype html><html><body onload="document.forms[0].submit()"><form action="${processUrl}" method="post">${inputs}<noscript><button type="submit">Continue to payment</button></noscript></form></body></html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}