import { describe, it, expect } from 'vitest';
import { calculateDelivery } from './delivery';

const settings = { freeThreshold: 100000, fee: 9900 };

describe('calculateDelivery', () => {
  it('charges the flat fee below the threshold', () => {
    expect(calculateDelivery(55000, settings)).toBe(9900);
  });

  it('charges the flat fee one cent below the threshold', () => {
    expect(calculateDelivery(99999, settings)).toBe(9900);
  });

  it('is free exactly at the threshold', () => {
    expect(calculateDelivery(100000, settings)).toBe(0);
  });

  it('is free above the threshold', () => {
    expect(calculateDelivery(150000, settings)).toBe(0);
  });

  it('charges nothing on an empty cart', () => {
    expect(calculateDelivery(0, settings)).toBe(0);
  });
});
