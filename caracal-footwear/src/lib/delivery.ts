export interface DeliverySettings {
  freeThreshold: number;
  fee: number;
}

export function calculateDelivery(
  subtotalCents: number,
  settings: DeliverySettings,
): number {
  // Free when the cart is empty or when the subtotal meets/exceeds the threshold
  if (subtotalCents === 0 || subtotalCents >= settings.freeThreshold) {
    return 0;
  }
  return settings.fee;
}