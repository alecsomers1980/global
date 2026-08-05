import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteSettings } from '@/lib/queries/products';
import { generateOrderNumber } from '@/lib/orders';
import { payfast } from '@/lib/payfast';
import {
  deriveOrderLines,
  orderTotals,
  checkAntiBot,
  type AvailableVariant,
  type CheckoutLine,
} from '@/lib/checkout';

export const runtime = 'nodejs';

interface CheckoutBody {
  items: CheckoutLine[];
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  honeypot: string;
  formRenderedAt: number;
}

function errorMessage(error: { type: string; productName?: string }): string {
  switch (error.type) {
    case 'empty_cart':
      return 'Your cart is empty.';
    case 'unavailable':
      return `${error.productName} is no longer available.`;
    case 'insufficient_stock':
      return `${error.productName} no longer has enough stock for this quantity.`;
    default:
      return 'Could not process your order.';
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;

    if (!checkAntiBot(body.honeypot ?? '', body.formRenderedAt ?? 0)) {
      return NextResponse.json({ error: 'Could not process your order.' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }
    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    if (!body.address1?.trim() || !body.city?.trim() || !body.province?.trim() || !body.postalCode?.trim()) {
      return NextResponse.json({ error: 'A full delivery address is required.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Authoritative pricing and stock, re-fetched from the database ─────
    const variantIds = [...new Set(body.items.map((i) => i.variantId))];
    const { data: rows, error: fetchErr } = await admin
      .from('product_variants')
      .select('id, colour_name, size, stock_qty, price_override, active, product:products(name, active, base_price)')
      .in('id', variantIds);
    if (fetchErr) throw fetchErr;

    const variants = new Map<string, AvailableVariant>();
    for (const row of rows ?? []) {
      const product = row.product as unknown as { name: string; active: boolean; base_price: number } | null;
      variants.set(row.id, {
        id: row.id,
        productName: product?.name ?? 'An item',
        colourName: row.colour_name,
        size: row.size,
        stockQty: row.stock_qty,
        priceCents: row.price_override ?? product?.base_price ?? 0,
        active: row.active && (product?.active ?? false),
      });
    }

    const derived = deriveOrderLines(body.items, variants);
    if ('error' in derived) {
      return NextResponse.json({ error: errorMessage(derived.error) }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const delivery = {
      freeThreshold: Number(settings.delivery_free_threshold),
      fee: Number(settings.delivery_fee),
    };
    const totals = orderTotals(derived.lines, delivery);

    if (totals.totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 });
    }

    // ── Persist the order ────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() ?? '',
        address_line1: body.address1.trim(),
        address_line2: body.address2?.trim() ?? '',
        city: body.city.trim(),
        province: body.province.trim(),
        postal_code: body.postalCode.trim(),
        subtotal: totals.subtotalCents,
        delivery_fee: totals.deliveryCents,
        total: totals.totalCents,
        status: 'pending',
      })
      .select('id, order_number, total')
      .single();
    if (orderErr || !order) throw orderErr ?? new Error('Failed to create order');

    const { error: itemsErr } = await admin.from('order_items').insert(
      derived.lines.map((l) => ({
        order_id: order.id,
        variant_id: l.variantId,
        product_name: l.productName,
        colour: l.colour,
        size: l.size,
        qty: l.qty,
        unit_price: l.unitPriceCents,
      })),
    );
    if (itemsErr) {
      // Don't leave an orphaned order row with no items behind.
      await admin.from('orders').delete().eq('id', order.id);
      throw itemsErr;
    }

    // ── Sign the PayFast payload ─────────────────────────────────────────
    const [firstName, ...rest] = body.name.trim().split(' ');
    const payfastData = payfast.createPaymentData({
      orderId: order.id,
      amount: order.total / 100,
      customerFirstName: firstName,
      customerLastName: rest.join(' ') || firstName,
      customerEmail: body.email.trim(),
      customerPhone: body.phone?.trim(),
      itemName: `Caracal Footwear order ${order.order_number}`,
    });

    const response = NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.order_number, total: order.total },
      payfastData,
      payfastUrl: payfast.getPaymentUrl(),
    });

    response.cookies.set('pending_order_id', order.id, {
      httpOnly: true,
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('[checkout]', error);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
