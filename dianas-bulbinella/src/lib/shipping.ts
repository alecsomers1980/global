/** Delivery pricing. Single source of truth — used by the checkout UI for
 *  display AND by the server when it recomputes the authoritative order total. */

export const FLAT_DELIVERY_FEE = 80;
export const FREE_DELIVERY_THRESHOLD = 800;

export type DeliveryMethod = "delivery" | "collection";

/** Collection is always free. Delivery is free once the subtotal reaches the
 *  threshold, otherwise a flat fee. */
export function calcShipping(
  subtotal: number,
  method: DeliveryMethod
): number {
  if (method === "collection") return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;
}

/** How much more the customer must spend to unlock free delivery (0 if already
 *  qualifying or collecting). */
export function amountToFreeDelivery(
  subtotal: number,
  method: DeliveryMethod
): number {
  if (method === "collection" || subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return FREE_DELIVERY_THRESHOLD - subtotal;
}
