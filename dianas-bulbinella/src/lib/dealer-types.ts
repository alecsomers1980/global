/** Client-safe dealer types and constants.
 *
 *  Kept out of lib/dealers.ts on purpose: that module imports the cookie-based
 *  Supabase server client (and therefore next/headers), so a "use client"
 *  component importing PROVINCES from it drags server-only code into the
 *  browser bundle and fails the build. Anything a client component needs lives
 *  here; lib/dealers.ts re-exports it for server callers. */

export type Dealer = {
  id: string;
  name: string;
  business: string;
  country: string;
  province: string;
  region: string;
  areas: string[];
  phone: string;
  phoneAlt: string;
  email: string;
  notes: string;
  isDepot: boolean;
  active: boolean;
  latitude: number | null;
  longitude: number | null;
};

/** The nine provinces, in the order Diana's list uses. */
export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export type DealerApplicationStatus = "pending" | "approved" | "declined";

/** Countries Diana has agents in. South Africa first — it's 150 of the 163. */
export const COUNTRIES = [
  "South Africa",
  "Namibia",
  "Botswana",
  "Mozambique",
] as const;

export const SOUTH_AFRICA = "South Africa";

/** International dialling codes, for turning a local number into a wa.me link. */
const DIAL_CODES: Record<string, string> = {
  "South Africa": "27",
  Namibia: "264",
  Botswana: "267",
  Mozambique: "258",
};

/**
 * Build a wa.me number from a dealer's phone.
 *
 * MUST be given the dealer's country: a Namibian mobile is also '081…', so
 * assuming +27 (as this did when every agent was South African) would send
 * customers to a completely different person's WhatsApp in another country.
 *
 * Returns null rather than guessing when the number isn't a form we recognise
 * — e.g. Namibian 6-digit landlines like Salon Luti's '223281', which need an
 * area code we don't have.
 */
export function whatsappNumber(phone: string, country: string): string | null {
  const raw = (phone ?? "").trim();
  if (!raw) return null;

  // Already international ('+267 71790428', '+258 84 519 7995').
  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 9 ? digits : null;
  }

  const digits = raw.replace(/\D/g, "");
  const code = DIAL_CODES[country];
  if (!code) return null;

  // Local mobile format: leading 0 + 9 more digits, in all four countries.
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${code}${digits.slice(1)}`;
  }
  return null;
}

/** Href for a tel: link — keeps '+' but drops spaces. */
export function telHref(phone: string): string {
  return `tel:${(phone ?? "").replace(/[^\d+]/g, "")}`;
}

/** Free-text match across name, business, town, province and country. */
export function matchesDealer(dealer: Dealer, needle: string): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return (
    dealer.name.toLowerCase().includes(q) ||
    dealer.business.toLowerCase().includes(q) ||
    dealer.country.toLowerCase().includes(q) ||
    dealer.province.toLowerCase().includes(q) ||
    dealer.region.toLowerCase().includes(q) ||
    dealer.areas.some((a) => a.toLowerCase().includes(q))
  );
}
