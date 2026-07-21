import React from "react";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPaid, type OrderStatus } from "@/lib/orders";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Download a PDF invoice for one order. Ownership is enforced by the "read own
 * orders" RLS policy (staff can also read any order), so a customer can only
 * ever pull their own invoice.
 */
export async function GET(
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

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "order_number, created_at, paid_at, email, full_name, phone, delivery_method, delivery_address, collection_point, subtotal, shipping, total, status"
      )
      .eq("id", id)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // No invoice until the money has actually landed.
    if (!isPaid(order.status as OrderStatus)) {
      return NextResponse.json(
        { error: "An invoice is available once payment is confirmed." },
        { status: 409 }
      );
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_title, size, unit_price, qty, line_total")
      .eq("order_id", id);
    if (itemsErr) throw itemsErr;

    // Dynamic import keeps @react-pdf out of the shared bundle.
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: InvoiceDocument } = await import(
      "@/lib/invoice/InvoiceDocument"
    );

    // renderToBuffer is typed to ReactElement<DocumentProps>; our component's
    // own props don't structurally match that, hence the cast at the boundary.
    const element = React.createElement(InvoiceDocument, {
      order: order as any,
      items: (items ?? []) as any,
    });
    const buffer = await renderToBuffer(element as any);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: any) {
    console.error("[account.invoice]", error);
    return NextResponse.json(
      { error: error?.message || "Could not build the invoice." },
      { status: 500 }
    );
  }
}
