/**
 * The month a report covers.
 *
 * Months are Johannesburg months, but Vercel runs the cron in UTC. South
 * Africa has no daylight saving, so SAST is a fixed UTC+2 and the conversion
 * is plain arithmetic: a SAST month starts at 22:00 UTC on the last day of the
 * month before.
 */

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type ReportPeriod = {
  /** "2026-09" */
  key: string;
  /** "September 2026" */
  label: string;
  /** First instant of the month, inclusive. */
  startUtc: string;
  /** First instant of the next month, exclusive. */
  endUtc: string;
  /** "2026-09-01" — GA4 reads dates in the property's own (SAST) timezone. */
  startDate: string;
  /** "2026-09-30", inclusive. */
  endDate: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** month is 0-based, and may overflow either way (Date.UTC normalises it). */
function periodFor(year: number, month: number): ReportPeriod {
  const start = new Date(Date.UTC(year, month, 1));
  const next = new Date(Date.UTC(year, month + 1, 1));
  const last = new Date(next.getTime() - 24 * 60 * 60 * 1000);
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();

  return {
    key: `${y}-${pad(m + 1)}`,
    label: `${MONTHS[m]} ${y}`,
    startUtc: new Date(start.getTime() - SAST_OFFSET_MS).toISOString(),
    endUtc: new Date(next.getTime() - SAST_OFFSET_MS).toISOString(),
    startDate: `${y}-${pad(m + 1)}-01`,
    endDate: `${y}-${pad(m + 1)}-${pad(last.getUTCDate())}`,
  };
}

/** The calendar month, in Johannesburg, before the one `now` falls in. */
export function previousMonth(now: Date = new Date()): ReportPeriod {
  const sast = new Date(now.getTime() + SAST_OFFSET_MS);
  return periodFor(sast.getUTCFullYear(), sast.getUTCMonth() - 1);
}

/** The month before `period`. */
export function monthBefore(period: ReportPeriod): ReportPeriod {
  const [y, m] = period.key.split("-").map(Number);
  return periodFor(y, m - 2);
}

/** "2026-09" → that month. Throws on anything else, so a bad URL is a 400. */
export function monthFromKey(key: string): ReportPeriod {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(key);
  if (!match) throw new Error(`Not a month: ${key}`);
  return periodFor(Number(match[1]), Number(match[2]) - 1);
}
