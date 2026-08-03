/**
 * Quicket API helpers
 *
 * Uses lazy environment reads: no env variable is accessed at module
 * load time, only inside the functions that need them.
 */

// -----------------------------------------------------
// Environment
// -----------------------------------------------------

export function getQuicketEnv() {
  const apiKey = process.env.QUICKET_API_KEY;
  const userToken = process.env.QUICKET_USER_TOKEN;

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable QUICKET_API_KEY"
    );
  }

  return {
    apiKey,
    userToken,
    base: "https://api.quicket.co.za/api",
  } as const;
}

// -----------------------------------------------------
// Types
// -----------------------------------------------------

export interface QuicketTicketType {
  id: number;
  name: string;
  price: number;
  soldOut: boolean;
  // Other fields (salesStart, salesEnd, donation, vendorTicket) are
  // returned by the API but are not used here.
}

export interface QuicketSchedule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface QuicketEvent {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  venue?: { name?: string };
  tickets: QuicketTicketType[];
  schedules: QuicketSchedule[];
}

// -----------------------------------------------------
// API call
// -----------------------------------------------------

/**
 * Fetch a single event by ID.
 *
 * Authentication: only the `api_key` query parameter is required
 * for public event data. The `usertoken` header is **not** sent here
 * because it is only needed for private resources.
 *
 * The guest-list endpoint is intentionally NOT implemented yet;
 * the exact path will be confirmed during Phase 1.
 */
export async function getEvent(
  eventId: string | number
): Promise<QuicketEvent> {
  const { apiKey, base } = getQuicketEnv();

  const url = `${base}/Events/${encodeURIComponent(
    eventId
  )}?api_key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Quicket API error (${res.status} ${res.statusText}): ${body}`
    );
  }

  const data = await res.json();

  // Coerce to QuicketEvent shape, defaulting arrays when missing
  return {
    id: data.id,
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    venue: data.venue,
    tickets: Array.isArray(data.tickets) ? data.tickets : [],
    schedules: Array.isArray(data.schedules) ? data.schedules : [],
  };
}