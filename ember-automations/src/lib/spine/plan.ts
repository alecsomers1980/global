import { z } from "zod";
import type { Size } from "./types";

export interface Plan {
  monthly_credits: number;
  max_active: number;
  credit_sizes: Record<Size, number>;
  turnaround: Record<Size, string>;
  rollover: boolean;
  renews_on: number;
}

export const DEFAULT_PLAN: Plan = {
  monthly_credits: 0,
  max_active: 1,
  credit_sizes: { S: 1, M: 3, L: 6 },
  turnaround: { S: "48h", M: "5wd", L: "quoted" },
  rollover: false,
  renews_on: 1,
};

const creditSizesSchema = z.object({
  S: z.number(),
  M: z.number(),
  L: z.number(),
});

const turnaroundSchema = z.object({
  S: z.string(),
  M: z.string(),
  L: z.string(),
});

const planSchema = z.object({
  monthly_credits: z.number().int().min(0).default(DEFAULT_PLAN.monthly_credits),
  max_active: z.number().int().min(1).default(DEFAULT_PLAN.max_active),
  credit_sizes: creditSizesSchema.default(DEFAULT_PLAN.credit_sizes),
  turnaround: turnaroundSchema.default(DEFAULT_PLAN.turnaround),
  rollover: z.boolean().default(DEFAULT_PLAN.rollover),
  renews_on: z.number().int().min(1).max(28).default(DEFAULT_PLAN.renews_on),
});

export function parsePlan(input: unknown): Plan {
  return planSchema.parse(input) as Plan;
}

export function creditsFor(plan: Plan, size: Size): number {
  return plan.credit_sizes[size];
}

export function periodOf(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day >= 1 && day <= 5) {
      remaining -= 1;
    }
  }
  return result;
}

export function dueBy(plan: Plan, size: Size, from: Date): Date | null {
  const turnaround = plan.turnaround[size];
  const hours = /^(\d+)h$/.exec(turnaround);
  if (hours) {
    return new Date(from.getTime() + Number(hours[1]) * 60 * 60 * 1000);
  }
  const workingDays = /^(\d+)wd$/.exec(turnaround);
  if (workingDays) {
    return addWorkingDays(from, Number(workingDays[1]));
  }
  return null;
}

export function balance(rows: { delta: number; period: string }[], plan: Plan, now: Date): number {
  const currentPeriod = periodOf(now);
  return rows.reduce((total, row) => {
    if (!plan.rollover && row.period !== currentPeriod) return total;
    return total + row.delta;
  }, 0);
}

