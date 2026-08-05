import { calculateDelivery } from './delivery';

export interface CheckoutLine {
  variantId: string;
  qty: number;
}

export interface AvailableVariant {
  id: string;
  productName: string;
  colourName: string;
  size: number;
  stockQty: number;
  priceCents: number;
  active: boolean;
}

export interface DerivedOrderLine {
  variantId: string;
  productName: string;
  colour: string;
  size: number;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export type CheckoutError =
  | { type: 'empty_cart' }
  | { type: 'unavailable'; productName: string }
  | { type: 'insufficient_stock'; productName: string };

export function deriveOrderLines(
  cartLines: CheckoutLine[],
  variants: Map<string, AvailableVariant>,
): { lines: DerivedOrderLine[] } | { error: CheckoutError } {
  if (cartLines.length === 0) {
    return { error: { type: 'empty_cart' } };
  }

  const lines: DerivedOrderLine[] = [];

  for (const line of cartLines) {
    const variant = variants.get(line.variantId);

    if (!variant) {
      return { error: { type: 'unavailable', productName: 'An item' } };
    }
    if (!variant.active) {
      return { error: { type: 'unavailable', productName: variant.productName } };
    }

    const rawQty = Math.floor(line.qty);
    if (variant.stockQty < rawQty) {
      return { error: { type: 'insufficient_stock', productName: variant.productName } };
    }

    const qty = Math.min(20, Math.max(1, rawQty));
    const unitPriceCents = variant.priceCents;
    const lineTotalCents = unitPriceCents * qty;

    lines.push({
      variantId: variant.id,
      productName: variant.productName,
      colour: variant.colourName,
      size: variant.size,
      qty,
      unitPriceCents,
      lineTotalCents,
    });
  }

  return { lines };
}

export function orderTotals(
  lines: DerivedOrderLine[],
  delivery: { freeThreshold: number; fee: number },
): { subtotalCents: number; deliveryCents: number; totalCents: number } {
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const deliveryCents = calculateDelivery(subtotalCents, delivery);
  const totalCents = subtotalCents + deliveryCents;
  return { subtotalCents, deliveryCents, totalCents };
}

export function checkAntiBot(
  honeypot: string,
  formRenderedAtMs: number,
  nowMs: number = Date.now(),
): boolean {
  const trimmed = honeypot.trim();
  if (trimmed !== '') return false;
  const diff = nowMs - formRenderedAtMs;
  return diff >= 3000 && diff < 3600000;
}