import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { payfast } from "@/lib/payfast";
import { calcShipping, type DeliveryMethod } from "@/lib/shipping";

export const runtime = "nodejs";

type IncomingItem = { variantId: string; qty: number };

/** Human-facing order reference, e.g. DB250716-4821. */
function generateOrderNumber(): string {
  const d = new Date();
  const stamp = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DB${stamp}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      email,
      fullName,
      phone,
      deliveryMethod,
      deliveryAddress,
      collectionPoint,
    } = body as {
      items: IncomingItem[];
      email: string;
      fullName: string;
      phone?: string;
      deliveryMethod: DeliveryMethod;
      deliveryAddress?: Record<string, string> | null;
      collectionPoint?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
    }
    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    if (deliveryMethod !== "delivery" && deliveryMethod !== "collection") {
      return NextResponse.json({ error: "Invalid delivery method." }, { status: 400 });
    }
    if (deliveryMethod === "delivery" && !deliveryAddress?.line1) {
      return NextResponse.json(
        { error: "A delivery address is required." },
        { status: 400 }
      );
    }

    // Link the order to the signed-in user, if there is one (guest checkout
    // is allowed — user_id stays null).
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    const admin = createAdminClient();

    // ── Authoritative pricing ────────────────────────────────────────────
    // Never trust prices from the client. Re-fetch each variant and today's
    // active special price, and recompute every line + the total here.
    const variantIds = [...new Set(items.map((i) => i.variantId))];
    const { data: variants, error: variantErr } = await admin
      .from("product_variants")
      .select("id, size, price, stock, image, product_id, products(slug, title)")
      .in("id", variantIds);

    if (variantErr) throw variantErr;
    if (!variants || variants.length !== variantIds.length) {
      return NextResponse.json(
        { error: "Some items are no longer available." },
        { status: 400 }
      );
    }

    const { data: specials } = await admin
      .from("active_special_prices")
      .select("variant_id, special_price")
      .in("variant_id", variantIds);
    const specialMap = new Map(
      (specials ?? []).map((s) => [s.variant_id, Number(s.special_price)])
    );

    const variantMap = new Map(variants.map((v: any) => [v.id, v]));

    const orderItems: {
      variant_id: string;
      product_slug: string;
      product_title: string;
      size: string;
      image: string;
      unit_price: number;
      qty: number;
      line_total: number;
    }[] = [];

    for (const item of items) {
      const v: any = variantMap.get(item.variantId);
      if (!v) {
        return NextResponse.json(
          { error: "Some items are no longer available." },
          { status: 400 }
        );
      }
      if (v.stock !== "instock") {
        return NextResponse.json(
          { error: `${v.products?.title ?? "An item"} is out of stock.` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
      const unitPrice = specialMap.get(v.id) ?? Number(v.price);
      const lineTotal = Math.round(unitPrice * qty * 100) / 100;

      orderItems.push({
        variant_id: v.id,
        product_slug: v.products?.slug ?? "",
        product_title: v.products?.title ?? "",
        size: v.size ?? "",
        image: v.image ?? "",
        unit_price: unitPrice,
        qty,
        line_total: lineTotal,
      });
    }

    const subtotal =
      Math.round(orderItems.reduce((s, i) => s + i.line_total, 0) * 100) / 100;
    const shipping = calcShipping(subtotal, deliveryMethod);
    const total = Math.round((subtotal + shipping) * 100) / 100;

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    // ── Persist the order ────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        email,
        full_name: fullName,
        phone: phone ?? "",
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
        collection_point: deliveryMethod === "collection" ? collectionPoint ?? "" : "",
        subtotal,
        shipping,
        total,
        status: "received",
      })
      .select("id, order_number, total")
      .single();

    if (orderErr || !order) throw orderErr ?? new Error("Failed to create order");

    const { error: itemsErr } = await admin
      .from("order_items")
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) throw itemsErr;

    // ── Sign the PayFast payload ─────────────────────────────────────────
    const [firstName, ...rest] = fullName.trim().split(" ");
    const payfastData = payfast.createPaymentData({
      orderId: order.id,
      amount: Number(order.total),
      customerFirstName: firstName,
      customerLastName: rest.join(" ") || firstName,
      customerEmail: email,
      customerPhone: phone,
      itemName: `Diana's Bulbinella order ${order.order_number}`,
    });

    const response = NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: Number(order.total),
      },
      payfastData,
      payfastUrl: payfast.getPaymentUrl(),
    });

    // Fallback so the return handler can find the order if PayFast omits it.
    response.cookies.set("pending_order_id", order.id, {
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });
    return response;
  } catch (error: any) {
    console.error("[checkout.create]", error);
    return NextResponse.json(
      { error: error?.message || "Could not start checkout." },
      { status: 500 }
    );
  }
}
