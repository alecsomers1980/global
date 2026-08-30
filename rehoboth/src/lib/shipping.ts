/**
 * Delivery charges.
 *
 * These rates are an ASSUMPTION, not the client's answer — spec §8.1 records
 * shipping as an open question. They live in the site_settings table so the
 * answer, when it comes, is a row update rather than a deploy, and the
 * constant below is only the fallback for a database that has not been seeded.
 */
export type ShippingSettings = {
  /** Flat national rate in rands. */
  flat: number;
  /** Order subtotal at or above which delivery is free. */
  free_over: number;
  /** Whether "collect from the farm" is offered at all. */
  collect_from_farm: boolean;
};

export const SHIPPING_FALLBACK: ShippingSettings = {
  flat: 99,
  free_over: 750,
  collect_from_farm: true,
};

/**
 * Delivery charge for a subtotal. Collection is always free; otherwise the
 * flat rate applies until the free-delivery threshold is reached.
 */
export function shippingFor(
  subtotal: number,
  collectFromFarm: boolean,
  settings: ShippingSettings = SHIPPING_FALLBACK
): number {
  if (collectFromFarm) return 0;
  return subtotal >= settings.free_over ? 0 : settings.flat;
}

/** How much more the customer must spend to reach free delivery, or 0. */
export function amountToFreeDelivery(
  subtotal: number,
  settings: ShippingSettings = SHIPPING_FALLBACK
): number {
  return Math.max(0, settings.free_over - subtotal);
}

/**
 * Read the live rates. Falls back to the constant above when the table or the
 * row is missing, so checkout never breaks on a settings lookup.
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return SHIPPING_FALLBACK;

  const { getServerClient } = await import("./supabase/server");
  const { data, error } = await getServerClient()
    .from("site_settings")
    .select("value")
    .eq("key", "shipping")
    .maybeSingle();

  if (error || !data) return SHIPPING_FALLBACK;
  return { ...SHIPPING_FALLBACK, ...(data.value as Partial<ShippingSettings>) };
}
