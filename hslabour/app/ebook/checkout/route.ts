import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEbookProduct } from "@/lib/ebook";
import { buildCheckout } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const buyer_name = String(form.get("buyer_name") ?? "").trim();
  const buyer_email = String(form.get("buyer_email") ?? "").trim();

  if (!buyer_email) {
    return new Response("Email is required", { status: 400 });
  }

  const product = await getEbookProduct();
  if (
    !product ||
    !product.is_active ||
    product.price_cents <= 0 ||
    !product.file_path
  ) {
    return new Response("E-book is not available for purchase.", {
      status: 400,
    });
  }

  const cookieStore = await cookies();
  const refCode = cookieStore.get("ref_code")?.value ?? "";

  const admin = createAdminClient();

  let affiliateId: string | null = null;
  if (refCode) {
    const { data: aff } = await admin
      .from("profiles")
      .select("id")
      .eq("affiliate_code", refCode)
      .eq("is_approved", true)
      .maybeSingle();
    affiliateId = aff?.id ?? null;
  }

  const { data: order, error } = await admin
    .from("ebook_orders")
    .insert({
      buyer_email,
      buyer_name: buyer_name || null,
      amount_cents: product.price_cents,
      status: "pending",
      affiliate_id: affiliateId,
      ref_code: refCode || null,
    })
    .select("id")
    .single();

  if (error || !order) {
    return new Response("Could not start checkout. Please try again.", {
      status: 500,
    });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const { processUrl, fields } = buildCheckout({
    amountCents: product.price_cents,
    itemName: product.title,
    mPaymentId: order.id,
    buyerEmail: buyer_email,
    buyerName: buyer_name,
    returnUrl: `${siteUrl}/ebook/success?order=${order.id}`,
    cancelUrl: `${siteUrl}/ebook?cancelled=1`,
    notifyUrl: `${siteUrl}/api/payfast/notify`,
    refCode: refCode || undefined,
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