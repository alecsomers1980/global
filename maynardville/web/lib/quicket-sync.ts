/**
 * Quicket → Airtable sync helpers.
 *
 * All Airtable interaction is self-contained here (no dependency on
 * any other project Airtable module).
 */

// -----------------------------------------------------
// Airtable helpers
// -----------------------------------------------------

export function getAirtableEnv() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey) {
    throw new Error("Missing required environment variable AIRTABLE_API_KEY");
  }
  if (!baseId) {
    throw new Error("Missing required environment variable AIRTABLE_BASE_ID");
  }

  return { apiKey, baseId };
}

/**
 * Airtable fetch wrapper.
 *
 * `pathAndQuery` may be e.g. "Performances?filterByFormula=…".
 * We carefully encode only the **path** segments (before any "?"),
 * leaving the query string untouched.
 */
async function aFetch(
  pathAndQuery: string,
  init?: RequestInit
): Promise<Response> {
  const { apiKey, baseId } = getAirtableEnv();

  const question = pathAndQuery.indexOf("?");
  const pathPart =
    question === -1 ? pathAndQuery : pathAndQuery.slice(0, question);
  const queryPart = question === -1 ? "" : pathAndQuery.slice(question);

  const segments = pathPart.split("/");
  const encoded = segments
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  const url = `https://api.airtable.com/v0/${baseId}/${encoded}${queryPart}`;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Airtable API error (${res.status} ${res.statusText}): ${body}`
    );
  }

  return res;
}

// -----------------------------------------------------
// Utility
// -----------------------------------------------------

/**
 * Best-effort split of an ISO-like datetime into a plain date
 * (YYYY-MM-DD) and a short time (HH:mm).  If no time portion is
 * present, `time` will be an empty string.
 */
function splitDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };

  const parts = iso.split(/[T ]/);
  const date = parts[0] || "";
  const timePart = parts[1] || "";
  const match = timePart.match(/\d{1,2}:\d{2}/);
  const time = match ? match[0] : "";

  return { date, time };
}

// -----------------------------------------------------
// Performance sync
// -----------------------------------------------------

interface PerformanceSource {
  scheduleId: number;
  name: string;
  start: string; // ISO-like datetime from Quicket
}

/**
 * Ensure each performance date (schedule) from a Quicket event
 * exists as a record in the Airtable "Performances" table.
 *
 * - Creates new records when no match is found.
 * - Updates existing records with date/time/event/schedule IDs
 *   but **never** overwrites Capacity, Active, or Performance Type.
 * - Sets the Season field only if it is currently empty.
 */
export async function syncPerformancesFromQuicket(
  eventId: string | number,
  season: string
): Promise<{ created: number; updated: number; total: number }> {
  // Lazy import – no top-level side-effects
  const { getEvent } = await import("./quicket");
  const ev = await getEvent(eventId);

  // Build list of performance sources (schedules or fallback)
  const sources: PerformanceSource[] =
    ev.schedules.length > 0
      ? ev.schedules.map((s) => ({
          scheduleId: s.id,
          name: s.name || ev.name,
          start: s.startDate,
        }))
      : [
          {
            scheduleId: 0,
            name: ev.name,
            start: ev.startDate,
          },
        ];

  let created = 0;
  let updated = 0;

  for (const src of sources) {
    const formula = `{Quicket Schedule ID}=${src.scheduleId}`;
    const filterUrl = `Performances?filterByFormula=${encodeURIComponent(
      formula
    )}`;

    const res = await aFetch(filterUrl);
    const body = await res.json();
    const records: any[] = body.records ?? [];

    const { date, time } = splitDateTime(src.start);

    if (records.length > 0) {
      // Update first matching record
      const record = records[0];
      const fields = record.fields ?? {};

      const patchFields: Record<string, unknown> = {
        Date: date,
        Time: time,
        "Quicket Event ID": Number(ev.id),
        "Quicket Schedule ID": src.scheduleId,
      };

      // Only set Season if it is empty on the existing record
      if (!fields.Season) {
        patchFields.Season = season;
      }

      await aFetch(`Performances/${record.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: patchFields }),
      });

      updated++;
    } else {
      // Create new record
      const postFields = {
        "Production/Event": src.name,
        Date: date,
        Time: time,
        Venue: ev.venue?.name || "",
        Season: season,
        "Performance Type": "Public",
        Active: true,
        "Quicket Event ID": Number(ev.id),
        "Quicket Schedule ID": src.scheduleId,
        // Capacity is intentionally omitted – it must only be set
        // manually in Airtable.
      };

      await aFetch("Performances", {
        method: "POST",
        body: JSON.stringify({ fields: postFields }),
      });

      created++;
    }
  }

  return {
    created,
    updated,
    total: sources.length,
  };
}

// -----------------------------------------------------
// Webhook sales ledger
// -----------------------------------------------------

/**
 * Append-only ledger that records ticket sales reported by the
 * Quicket webhook.
 *
 * Matching a sale to a specific Performance is done via
 * `event_id` + the date part of `event_date` – a documented
 * limitation because Quicket webhook payloads do not carry
 * schedule IDs.
 */
export async function recordWebhookSale(
  payload: any
): Promise<{ recorded: number }> {
  // Only act on checkout_completed events
  if (payload.action !== "checkout_completed") {
    return { recorded: 0 };
  }

  let performanceRecordId: string | undefined;

  try {
    // 1. Find matching Performance in Airtable
    const evId = Number(payload.event_id);
    if (!Number.isNaN(evId)) {
      const filter = `{Quicket Event ID}=${evId}`;
      const perfUrl = `Performances?filterByFormula=${encodeURIComponent(
        filter
      )}`;
      const perfRes = await aFetch(perfUrl);
      const perfBody = await perfRes.json();
      const perfRecords: any[] = perfBody.records ?? [];

      if (perfRecords.length > 0) {
        // If event_date is present, pick the record whose Date matches that date
        if (payload.event_date) {
          const webhookDate = splitDateTime(payload.event_date).date;
          const match = perfRecords.find(
            (r: any) => r.fields?.Date === webhookDate
          );
          performanceRecordId = match?.id;
        }

        // Fallback to the first returned record if no match by date
        if (!performanceRecordId) {
          performanceRecordId = perfRecords[0]?.id;
        }
      }
    }
  } catch {
    // If we cannot find a performance, leave the link empty.
    // The sale is still recorded as an orphan for manual reconciliation.
    performanceRecordId = undefined;
  }

  // 2. Group ticket lines by ticket_type
  const tickets: any[] = Array.isArray(payload.tickets)
    ? payload.tickets
    : [];
  const groups = new Map<string, { price: number; count: number }>();

  for (const ticket of tickets) {
    const type = ticket?.ticket_type;
    if (typeof type !== "string" || type.trim() === "") continue; // skip malformed

    const price = Number(ticket?.price);
    if (Number.isNaN(price)) continue; // skip lines without a valid price

    const existing = groups.get(type);
    if (existing) {
      existing.count += 1;
      // If the price varies within the same type, use the last value seen.
      // In practice Quicket ensures uniform pricing per ticket type.
      existing.price = price;
    } else {
      groups.set(type, { price, count: 1 });
    }
  }

  let recorded = 0;

  // 3. Create one “Quicket Sales” record per ticket type
  for (const [type, info] of Array.from(groups.entries())) {
    const fields: Record<string, unknown> = {
      "Ticket Type Name": type,
      Price: info.price,
      "Quantity Sold": info.count,
      "Synced At": new Date().toISOString(),
    };

    if (performanceRecordId) {
      // Airtable link field: array of record IDs
      fields.Performance = [performanceRecordId];
    }

    await aFetch("Quicket Sales", {
      method: "POST",
      body: JSON.stringify({ fields }),
    });

    recorded++;
  }

  return { recorded };
}