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
}

const COLUMNS =
  "stock_number,make,model,year,mileage,price,condition,condition_rating," +
  "colour,sold_roadworthy,eligible_for_finance,features,description," +
  "main_image_url,gallery_urls";

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

/** Fetch one vehicle — by stock number if given, else the first row. */
export async function fetchVehicle(stockNumber?: string): Promise<Vehicle> {
  const { url, key } = readCreds();
  const filter = stockNumber ? `&stock_number=eq.${encodeURIComponent(stockNumber)}` : "";
  const res = await fetch(`${url}/rest/v1/cars?select=${COLUMNS}${filter}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Vehicle[];
  if (!rows.length) throw new Error(`No vehicle found${stockNumber ? ` for stock ${stockNumber}` : ""}.`);
  return rows[0];
}
