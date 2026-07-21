import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/db";

// Types/constants live in dealer-types.ts so client components can import them
// without pulling this module's server-only Supabase client into the browser.
// Re-exported here so server callers only need one import.
export {
  PROVINCES,
  COUNTRIES,
  SOUTH_AFRICA,
  whatsappNumber,
  telHref,
  matchesDealer,
  type Dealer,
  type DealerApplicationStatus,
} from "@/lib/dealer-types";

import type { Dealer } from "@/lib/dealer-types";
import { PROVINCES, SOUTH_AFRICA } from "@/lib/dealer-types";

// "*" (not an explicit list) so the query keeps working whether or not
// migration 0013 (latitude/longitude) has been applied yet — a missing column
// in an explicit select would 42703 and blank the whole dealer list. toDealer
// only reads the fields it needs; extra columns are ignored.
const FIELDS = "*";

/* eslint-disable @typescript-eslint/no-explicit-any */
function toDealer(row: any): Dealer {
  return {
    id: row.id,
    name: row.name ?? "",
    business: row.business ?? "",
    country: row.country || SOUTH_AFRICA,
    province: row.province ?? "",
    region: row.region ?? "",
    areas: row.areas ?? [],
    phone: row.phone ?? "",
    phoneAlt: row.phone_alt ?? "",
    email: row.email ?? "",
    notes: row.notes ?? "",
    isDepot: Boolean(row.is_depot),
    active: Boolean(row.active),
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

/** Active dealers for the public page. Uses the anon no-cookie client so the
 *  page can be cached/prerendered like the rest of the storefront. */
export const getPublicDealers = cache(async (): Promise<Dealer[]> => {
  // Not configured yet (no Supabase env) — degrade to empty rather than crash.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicClient();

  // Log and fall back to empty, the same way catalog.ts does: a storefront
  // visitor must never be shown a raw PostgREST error, whatever is wrong
  // server-side. The page renders its "no agents" state instead.
  try {
    const rows = await fetchAll<any>((from, to) =>
      supabase
        .from("dealers")
        .select(FIELDS)
        .eq("active", true)
        .order("country")
        .order("province")
        .order("sort")
        .range(from, to)
    );
    return rows.map(toDealer);
  } catch (error: any) {
    console.error("dealers: query failed —", error?.message ?? error);
    return [];
  }
});

/** Every dealer, active or not — for the admin. */
export async function getAllDealers(): Promise<Dealer[]> {
  const supabase = await createClient();
  const rows = await fetchAll<any>((from, to) =>
    supabase
      .from("dealers")
      .select(FIELDS)
      .order("country")
      .order("province")
      .order("sort")
      .range(from, to)
  );
  return rows.map(toDealer);
}

export async function getDealer(id: string): Promise<Dealer | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("dealers").select(FIELDS).eq("id", id).maybeSingle();
  return data ? toDealer(data) : null;
}

/** Group dealers by country, then province, then region — preserving
 *  PROVINCES order within South Africa. International dealers have no
 *  province (Diana's Namibia/Botswana/Mozambique lists are town-only), so
 *  that level is simply skipped for them rather than shown as a blank
 *  heading. South Africa is always sorted first. */
export function groupByProvince(dealers: Dealer[]) {
  type ProvinceGroup = { province: string; regions: { region: string; dealers: Dealer[] }[] };
  const byCountry = new Map<string, Map<string, Map<string, Dealer[]>>>();

  for (const dealer of dealers) {
    if (!byCountry.has(dealer.country)) byCountry.set(dealer.country, new Map());
    const byProvince = byCountry.get(dealer.country)!;

    if (!byProvince.has(dealer.province)) byProvince.set(dealer.province, new Map());
    const regions = byProvince.get(dealer.province)!;

    const key = dealer.region || "";
    if (!regions.has(key)) regions.set(key, []);
    regions.get(key)!.push(dealer);
  }

  const provinceOrder = (p: string) => {
    const i = (PROVINCES as readonly string[]).indexOf(p);
    return i === -1 ? 99 : i;
  };

  const countryOrder = (c: string) => (c === SOUTH_AFRICA ? 0 : 1);

  return [...byCountry.entries()]
    .sort((a, b) => countryOrder(a[0]) - countryOrder(b[0]) || a[0].localeCompare(b[0]))
    .map(([country, byProvince]) => ({
      country,
      provinces: [...byProvince.entries()]
        .sort((a, b) => provinceOrder(a[0]) - provinceOrder(b[0]) || a[0].localeCompare(b[0]))
        .map(
          ([province, regions]): ProvinceGroup => ({
            province,
            regions: [...regions.entries()]
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([region, list]) => ({
                region,
                dealers: [...list].sort((a, b) =>
                  (a.areas[0] ?? a.name).localeCompare(b.areas[0] ?? b.name)
                ),
              })),
          })
        ),
    }));
}

/** Map an admin form payload to a dealers row.
 *  Shared by POST and PATCH so both agree on which fields are writable —
 *  `seed_key` deliberately isn't, so a hand-edit can never collide with the
 *  seed's upsert key. `areas` accepts either an array or a comma-separated
 *  string, since the form posts the latter. */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function dealerToRow(body: any) {
  return {
    name: String(body.name ?? "").trim(),
    business: String(body.business ?? "").trim(),
    country: String(body.country ?? "").trim() || SOUTH_AFRICA,
    province: String(body.province ?? "").trim(),
    region: String(body.region ?? "").trim(),
    areas: Array.isArray(body.areas)
      ? body.areas.map((a: string) => String(a).trim()).filter(Boolean)
      : String(body.areas ?? "")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
    phone: String(body.phone ?? "").trim(),
    phone_alt: String(body.phone_alt ?? "").trim(),
    email: String(body.email ?? "").trim(),
    notes: String(body.notes ?? "").trim(),
    is_depot: Boolean(body.is_depot),
    active: body.active === undefined ? true : Boolean(body.active),
  };
}
