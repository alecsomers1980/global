const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatPeriod(year: number, month: number): string {
  return String(year) + "-" + String(month).padStart(2, "0");
}

function parsePeriod(period: string): { year: number; month: number } {
  if (!PERIOD_PATTERN.test(period)) {
    throw new Error(`invalid period: ${period}`);
  }

  return {
    year: Number(period.slice(0, 4)),
    month: Number(period.slice(5, 7)),
  };
}

export function previousPeriod(now: Date): string {
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();

  if (monthIndex === 0) {
    return formatPeriod(year - 1, 12);
  }

  return formatPeriod(year, monthIndex);
}

export function periodOfDate(d: Date): string {
  return formatPeriod(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export function periodBounds(period: string): { start: Date; end: Date } {
  const { year, month } = parsePeriod(period);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return { start, end };
}

export function periodLabel(period: string): string {
  const { year, month } = parsePeriod(period);

  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function isWithinDays(t: Date, now: Date, minDays: number, maxDays: number): boolean {
  const ageMs = now.getTime() - t.getTime();
  if (ageMs < 0) {
    return false;
  }

  const ageDays = ageMs / 86_400_000;
  return ageDays >= minDays && ageDays <= maxDays;
}

