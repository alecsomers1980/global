export const MIN_SUBMIT_MS = 3000;

export interface QuotePayload {
  name: string;
  email: string;
  phone: string;
  experience?: string;
  destination?: string;
  comfort?: string;
  dateFrom?: string;
  dateTo?: string;
  adults?: number;
  children?: number;
  message?: string;
  sourcePage?: string;
}

export function validateQuote(input: unknown):
  | { ok: true; data: QuotePayload }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Gracefully handle non-objects: treat as empty input so required fields fail
  if (input === null || typeof input !== 'object') {
    // fall through with empty payload
    input = {};
  }

  const body = input as Record<string, unknown>;

  // Trim strings helper
  const trim = (value: unknown): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined;

  const name = trim(body.name);
  const email = trim(body.email);
  const phone = trim(body.phone);

  if (!name) errors.name = 'Please tell us your name.';

  if (!email) {
    errors.email = 'Please give us an email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'That does not look like a valid email address.';
  }

  if (!phone) errors.phone = 'Please give us a phone number.';

  // Optional numeric fields
  const adultsRaw = (body.adults === '' || body.adults === undefined) ? undefined : Number(body.adults);
  const childrenRaw = (body.children === '' || body.children === undefined) ? undefined : Number(body.children);

  if (adultsRaw !== undefined && (!Number.isFinite(adultsRaw) || adultsRaw < 1)) {
    errors.adults = 'There needs to be at least one adult.';
  }
  if (childrenRaw !== undefined && (!Number.isFinite(childrenRaw) || childrenRaw < 0)) {
    errors.children = 'Number of children cannot be negative.';
  }

  const dateFrom = trim(body.dateFrom);
  const dateTo = trim(body.dateTo);
  if (dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom)) {
    errors.dateTo = 'The return date cannot be before the arrival date.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Build clean data with optional empty strings turned into undefined
  const data: QuotePayload = {
    name: name!,
    email: email!,
    phone: phone!,
    experience: trim(body.experience) || undefined,
    destination: trim(body.destination) || undefined,
    comfort: trim(body.comfort) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    adults: adultsRaw,
    children: childrenRaw,
    message: trim(body.message) || undefined,
    sourcePage: trim(body.sourcePage) || undefined,
  };

  return { ok: true, data };
}

export function isBot(
  input: { website?: string; renderedAt?: number },
  now?: number
): boolean {
  const current = now ?? Date.now();
  if (input.website) return true;
  if (typeof input.renderedAt !== 'number') return true;
  if (current - input.renderedAt < MIN_SUBMIT_MS) return true;
  return false;
}
