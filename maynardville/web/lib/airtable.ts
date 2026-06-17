// Airtable REST API wrapper – no SDK, using fetch.
// All sensitive values come from environment variables.

function getAirtableEnv() {
  const API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!API_KEY || !BASE_ID) {
    throw new Error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables.");
  }
  return { API_KEY, BASE_ID };
}

// Table names used across the app.
const TABLE = {
  PERFORMANCES: "Performances",
  COMP_REQUESTS: "Comp Requests",
  REQUESTERS: "Requesters",
  CATEGORIES: "Categories",
} as const;

// Base fetch helper that adds auth header and handles errors.
async function airtableFetch(
  tablePathAndQuery: string,
  init?: RequestInit
): Promise<any> {
  const { API_KEY, BASE_ID } = getAirtableEnv();
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tablePathAndQuery}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    ...init?.headers,
  };

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Airtable API error (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}

// ---------- Helpers to map Airtable records ---------- //
function mapRequester(record: any): import("./types").Requester {
  return {
    id: record.id,
    name: record.fields["Name"] ?? "",
    email: record.fields["Email"] ?? "",
    role: record.fields["Role"] ?? "",
    allowedCategoryIds: Array.isArray(record.fields["Allowed Categories"])
      ? record.fields["Allowed Categories"]
      : [],
  };
}

function mapPerformance(record: any): import("./types").Performance {
  return {
    id: record.id,
    label:
      record.fields["Performance Label"] ||
      [record.fields["Production/Event"], record.fields["Date"]]
        .filter(Boolean)
        .join(" — ") ||
      "Performance",
    date: record.fields["Date"] ?? "",
    time: record.fields["Time"] ?? "",
    venue: record.fields["Venue"] ?? "",
    performanceType: record.fields["Performance Type"] ?? "",
    season: record.fields["Season"] ?? "",
  };
}

function mapCategory(record: any): import("./types").Category {
  return {
    id: record.id,
    name: record.fields["Category Name"] ?? "",
  };
}

// ---------- Public API functions ---------- //

/**
 * Looks up a Requester using a magic link token and ensures they are active.
 * Returns the first matched Requester or null.
 */
export async function getRequesterByToken(token: string) {
  const formula = `AND({Magic Link Token}="${token}",{Active}=1)`;
  const path = `${TABLE.REQUESTERS}?filterByFormula=${encodeURIComponent(formula)}`;
  const data = await airtableFetch(path);
  if (data.records && data.records.length > 0) {
    return mapRequester(data.records[0]);
  }
  return null;
}

/**
 * Fetches a single Requester by record id. Used for server-side authorisation
 * (confirming a submitted category is within the requester's allowed set).
 */
export async function getRequesterById(id: string) {
  const data = await airtableFetch(`${TABLE.REQUESTERS}/${encodeURIComponent(id)}`);
  return mapRequester(data);
}

/**
 * Returns all active performances for a given season, sorted by date.
 */
export async function listActivePerformances(season: string) {
  const formula = `AND({Active}=1,{Season}="${season}")`;
  const path = `${TABLE.PERFORMANCES}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Date&sort[0][direction]=asc`;
  const data = await airtableFetch(path);
  return (data.records ?? []).map(mapPerformance);
}

/**
 * Given an array of category IDs, returns corresponding Category objects.
 * Fetches all categories and filters client‑side (expected to be a small list).
 */
export async function listCategoriesByIds(ids: string[]) {
  const path = `${TABLE.CATEGORIES}`;
  const data = await airtableFetch(path);
  const allCategories: any[] = data.records ?? [];
  return allCategories
    .filter((rec) => ids.includes(rec.id))
    .map(mapCategory);
}

/**
 * Creates a new Comp Request record and returns its ID.
 */
export async function createCompRequest(input: import("./types").CompRequestInput) {
  const fields: Record<string, any> = {
    "Guest Name": input.guestName,
    "Guest Surname": input.guestSurname,
    "Performance": [input.performanceId],       // linked record
    "Category": [input.categoryId],             // linked record
    "Guest Email": input.guestEmail,
    "House Seats": input.houseSeats,
    "Notes": input.notes,
    "Total Seats Requested": input.totalSeats,
    "Ticket Status": "REQUEST",
    "Requester": [input.requesterId],           // linked record
  };

  const path = TABLE.COMP_REQUESTS;
  const body = JSON.stringify({ fields });

  const data = await airtableFetch(path, {
    method: "POST",
    body,
  });

  return data.id as string;
}