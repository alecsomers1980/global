import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Resolve a past order into cart items at TODAY's prices/availability.
 *
 * Returns the items the browser should add to its (client-side) cart, plus a
 * list of anything that can no longer be bought so we can tell the customer.
 * Reads go through the user's own client, so the "read own orders" RLS policy
 * enforces ownership — a customer can't reorder someone else's order.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // RLS restricts this to the caller's own orders.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("variant_id, product_title, size, qty")
      .eq("order_id", id);
    if (itemsErr) throw itemsErr;

    const variantIds = (items ?? [])
      .map((i) => i.variant_id)
      .filter((v): v is string => Boolean(v));

    const resolved: {
      slug: string;
      variantId: string;
      title: string;
      price: number;
      salePrice: number | null;
      image: string;
      size: string;
      qty: number;
    }[] = [];
    const skipped: string[] = [];

    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, size, price, stock, image, products(slug, title, active)")
        .in("id", variantIds);

      const { data: specials } = await supabase
        .from("active_special_prices")
        .select("variant_id, special_price")
        .in("variant_id", variantIds);
      const specialMap = new Map(
        (specials ?? []).map((s) => [s.variant_id, Number(s.special_price)])
      );
      const variantMap = new Map((variants ?? []).map((v: any) => [v.id, v]));

      for (const item of items ?? []) {
        const v: any = item.variant_id ? variantMap.get(item.variant_id) : null;
        const label = `${item.product_title}${item.size ? ` (${item.size})` : ""}`;

        // Variant deleted, product deactivated, or out of stock → can't reorder.
        if (!v || !v.products?.active || v.stock !== "instock") {
          skipped.push(label);
          continue;
        }

        resolved.push({
          slug: v.products.slug,
          variantId: v.id,
          title: v.products.title,
          price: Number(v.price),
          salePrice: specialMap.get(v.id) ?? null,
          image: v.image ?? "",
          size: v.size ?? "",
          qty: item.qty,
        });
      }
    } else {
      for (const item of items ?? []) {
        skipped.push(
          `${item.product_title}${item.size ? ` (${item.size})` : ""}`
        );
      }
    }

    return NextResponse.json({ items: resolved, skipped });
  } catch (error: any) {
    console.error("[account.reorder]", error);
    return NextResponse.json(
      { error: error?.message || "Could not rebuild that order." },
      { status: 500 }
    );
  }
}
