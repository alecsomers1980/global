import { DESIGNS, DESIGN_IDS, DELIVERY, PRICE_SET_CENTS, PRICE_BAGTAG_CENTS } from '@/lib/designs';
import type { DeliveryOption } from '@/lib/designs';
import { ensureSchema, insertPendingOrder } from '@/lib/db';
import { payfast } from '@/lib/payfast';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      designId,
      bagTag,
      childName,
      deliveryOption,
      pudoLocation,
      deliveryAddress,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // --- Validation ---
    if (!DESIGN_IDS.has(designId)) {
      return Response.json({ error: "Invalid design selection." }, { status: 400 });
    }

    const child = childName?.trim();
    if (!child || child.length < 1 || child.length > 20) {
      return Response.json({ error: "Child name must be between 1 and 20 characters." }, { status: 400 });
    }

    if (!['collect', 'pudo', 'courierguy'].includes(deliveryOption)) {
      return Response.json({ error: "Invalid delivery option." }, { status: 400 });
    }

    if (deliveryOption === 'pudo') {
      if (!pudoLocation || !pudoLocation.trim()) {
        return Response.json({ error: "PUDO location is required." }, { status: 400 });
      }
    }
    if (deliveryOption === 'courierguy') {
      if (!deliveryAddress || !deliveryAddress.trim()) {
        return Response.json({ error: "Delivery address is required." }, { status: 400 });
      }
    }

    const custName = customerName?.trim();
    if (!custName || custName.length < 2) {
      return Response.json({ error: "Customer name must be at least 2 characters." }, { status: 400 });
    }

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    const phoneDigits = (customerPhone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return Response.json({ error: "Phone number must be 10 digits." }, { status: 400 });
    }

    // --- Amount ---
    let amountCents = PRICE_SET_CENTS;
    if (bagTag) amountCents += PRICE_BAGTAG_CENTS;
    amountCents += DELIVERY[deliveryOption as DeliveryOption].priceCents;

    // --- Order ID ---
    const orderId = crypto.randomUUID();

    // --- Design Name ---
    const design = DESIGNS.find(d => d.id === designId)!;
    const designName = design.name;

    // --- Insert pending order ---
    await ensureSchema();
    await insertPendingOrder({
      id: orderId,
      amountCents,
      designId,
      designName,
      childName: child,
      bagTag: !!bagTag,
      deliveryOption,
      deliveryAddress: deliveryOption === 'courierguy' ? deliveryAddress.trim() : null,
      pudoLocation: deliveryOption === 'pudo' ? pudoLocation.trim() : null,
      customerName: custName,
      customerEmail: customerEmail.trim(),
      customerPhone: phoneDigits,
      notes: notes?.trim() || null,
    });

    // --- PayFast payment data ---
    const nameParts = custName.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '-';

    const paymentData = payfast.createPaymentData({
      orderId,
      amountCents,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: customerEmail.trim(),
      customerPhone: phoneDigits,
      itemName: 'Stick to Your Name — Label set',
      itemDescription: `Order ${orderId.slice(0,8)} — ${designName} — ${child.toUpperCase()}`,
    });

    return Response.json({
      orderId,
      paymentUrl: payfast.getPaymentUrl(),
      fields: paymentData, // all values are strings
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return Response.json({ error: 'Could not create order, please try again.' }, { status: 500 });
  }
}
