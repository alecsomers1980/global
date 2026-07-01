import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Minimal read-only Supabase access (REST, no SDK) to pull a source vehicle
 * from the everest-motoring `cars` table. Credentials are read from this
 * project's env, or fall back to the everest-motoring/.env.local next door.
 */

export interface Vehicle {
  stock_number: string | null;
  make: string;
  model: string; // includes the variant, e.g. "T-Roc 1.4 TSI Design Auto"
  year: number;
  mileage: number;
  price: number;
  condition: "new" | "used" | string;
  condition_rating: string; // New | Excellent | Good | Average | Poor | Non-runner
  colour: string;
  sold_roadworthy: boolean | null;
  eligible_for_finance: boolean | null;
  features: string[] | null;
  description: string | null;
  main_image_url: string | null;
  gallery_urls: string[] | null;
  // AutoTrader listing detail
  transmission: string | null; // "Automatic" | "Manual"
  fuel_type: string | null;
  service_history: string | null; // full | full_franchise | partial | none | ...
  manufacturer_colour: string | null;
  previous_owners: number | null;
  accident_involved: boolean | null;
  has_warranty: boolean | null;
  warranty_end_date: string | null;
  warranty_mileage: number | null;
  registration_number: string | null;
  vin: string | null;
  trade_in_price: number | null;
  reconditioning_cost: number | null;
}

const COLUMNS =
  "stock_number,make,model,year,mileage,price,condition,condition_rating," +
  "colour,sold_roadworthy,eligible_for_finance,features,description," +
  "main_image_url,gallery_urls,transmission,fuel_type,service_history," +
  "manufacturer_colour,previous_owners,accident_involved,has_warranty," +
  "warranty_end_date,warranty_mileage,registration_number,vin," +
  "trade_in_price,reconditioning_cost";

function readCreds(): { url: string; key: string } {
  let url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (url && key) return { url, key };

  // Fall back to the sibling everest-motoring project's env.local.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(here, "..", "..", "..", "everest-motoring", ".env.local");
  const env = fs.readFileSync(envPath, "utf8");
  const get = (k: string) =>
    (env.match(new RegExp("^" + k + "=(.*)$", "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
  url = url || get("NEXT_PUBLIC_SUPABASE_URL");
  key = key || get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase URL/key not found in env or everest-motoring/.env.local");
  return { url, key };
}

/** Fetch one vehicle — by id (preferred), else stock number, else first row. */
export async function fetchVehicle(opts?: { id?: string; stock?: string }): Promise<Vehicle> {
  const { url, key } = readCreds();
  const filter = opts?.id
    ? `&id=eq.${encodeURIComponent(opts.id)}`
    : opts?.stock
      ? `&stock_number=eq.${encodeURIComponent(opts.stock)}`
      : "";
  const res = await fetch(`${url}/rest/v1/cars?select=${COLUMNS}${filter}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Vehicle[];
  if (!rows.length) throw new Error(`No vehicle found${opts?.id ? ` for id ${opts.id}` : opts?.stock ? ` for stock ${opts.stock}` : ""}.`);
  return rows[0];
}

export interface VehicleListItem {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  price: number | null;
  mileage: number | null;
  stock_number: string | null;
  status: string | null;
  image: string | null;
}

/** Fetch the stock list for the local dashboard (lightweight columns only). */
export async function fetchVehicles(): Promise<VehicleListItem[]> {
  const { url, key } = readCreds();
  const cols = "id,year,make,model,price,mileage,stock_number,status,main_image_url";
  const res = await fetch(`${url}/rest/v1/cars?select=${cols}&order=make.asc&limit=200`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as (Record<string, unknown>)[];
  return rows.map((r) => ({
    id: String(r.id),
    year: (r.year as number) ?? null,
    make: (r.make as string) ?? null,
    model: (r.model as string) ?? null,
    price: (r.price as number) ?? null,
    mileage: (r.mileage as number) ?? null,
    stock_number: (r.stock_number as string) ?? null,
    status: (r.status as string) ?? null,
    image: (r.main_image_url as string) ?? null,
  }));
}
