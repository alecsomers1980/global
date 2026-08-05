/**
 * Order status vocabulary. `paid` and `stock_conflict` are set ONLY by the
 * PayFast ITN handler (src/app/api/payfast/notify/route.ts) -- never by hand,
 * never by the checkout route. See that file for why.
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'stock_conflict'
  | 'fulfilled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Payment received',
  failed: 'Payment failed',
  cancelled: 'Cancelled',
  stock_conflict: 'Stock conflict',
  fulfilled: 'Fulfilled',
};

/** Human-facing order reference, e.g. CF260805-4821. */
export function generateOrderNumber(): string {
  const d = new Date();
  const stamp =
    `${d.getFullYear() % 100}` +
    `${String(d.getMonth() + 1).padStart(2, '0')}` +
    `${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CF${stamp}-${rand}`;
}
