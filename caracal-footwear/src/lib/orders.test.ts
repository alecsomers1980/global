import { describe, it, expect } from 'vitest';
import { generateOrderNumber, ORDER_STATUS_LABELS } from './orders';

describe('generateOrderNumber', () => {
  it('matches CF + 6-digit date + dash + 4-digit random', () => {
    expect(generateOrderNumber()).toMatch(/^CF\d{6}-\d{4}$/);
  });

  it('produces different numbers across calls', () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    // Collision odds are 1 in 9000 -- not flaky in practice, and if it ever
    // does collide it's telling us something real about the random range.
    expect(a).not.toBe(b);
  });
});

describe('ORDER_STATUS_LABELS', () => {
  it('has a label for every status', () => {
    const statuses = ['pending', 'paid', 'failed', 'cancelled', 'stock_conflict', 'fulfilled'] as const;
    for (const s of statuses) {
      expect(ORDER_STATUS_LABELS[s]).toBeTruthy();
    }
  });
});
