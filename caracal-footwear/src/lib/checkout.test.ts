import { describe, it, expect } from 'vitest';
import { deriveOrderLines, orderTotals, checkAntiBot, type AvailableVariant } from './checkout';

function variant(over: Partial<AvailableVariant> = {}): AvailableVariant {
  return {
    id: 'v1', productName: 'Classic Chukka', colourName: 'Tan', size: 9,
    stockQty: 10, priceCents: 55000, active: true, ...over,
  };
}

describe('deriveOrderLines', () => {
  it('errors on an empty cart', () => {
    const result = deriveOrderLines([], new Map());
    expect(result).toEqual({ error: { type: 'empty_cart' } });
  });

  it('errors when a variant no longer exists', () => {
    const result = deriveOrderLines([{ variantId: 'missing', qty: 1 }], new Map());
    expect(result).toEqual({ error: { type: 'unavailable', productName: 'An item' } });
  });

  it('errors when a variant is inactive', () => {
    const variants = new Map([['v1', variant({ active: false })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 1 }], variants);
    expect(result).toEqual({ error: { type: 'unavailable', productName: 'Classic Chukka' } });
  });

  it('errors when requested qty exceeds stock', () => {
    const variants = new Map([['v1', variant({ stockQty: 2 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 5 }], variants);
    expect(result).toEqual({ error: { type: 'insufficient_stock', productName: 'Classic Chukka' } });
  });

  it('derives a line with the DATABASE price, ignoring any client-sent price', () => {
    const variants = new Map([['v1', variant({ priceCents: 55000 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 2 }], variants);
    expect(result).toEqual({
      lines: [{
        variantId: 'v1', productName: 'Classic Chukka', colour: 'Tan', size: 9,
        qty: 2, unitPriceCents: 55000, lineTotalCents: 110000,
      }],
    });
  });

  it('clamps qty to the 1-20 range', () => {
    const variants = new Map([['v1', variant({ stockQty: 999 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 999 }], variants);
    expect('lines' in result && result.lines[0].qty).toBe(20);
  });
});

describe('orderTotals', () => {
  const delivery = { freeThreshold: 100000, fee: 9900 };

  it('adds delivery below the threshold', () => {
    const lines = [{ variantId: 'v1', productName: 'X', colour: 'Tan', size: 9, qty: 1, unitPriceCents: 55000, lineTotalCents: 55000 }];
    expect(orderTotals(lines, delivery)).toEqual({
      subtotalCents: 55000, deliveryCents: 9900, totalCents: 64900,
    });
  });

  it('is free at or above the threshold', () => {
    const lines = [{ variantId: 'v1', productName: 'X', colour: 'Tan', size: 9, qty: 2, unitPriceCents: 55000, lineTotalCents: 110000 }];
    expect(orderTotals(lines, delivery)).toEqual({
      subtotalCents: 110000, deliveryCents: 0, totalCents: 110000,
    });
  });
});

describe('checkAntiBot', () => {
  it('rejects a filled honeypot', () => {
    expect(checkAntiBot('spam', Date.now() - 5000)).toBe(false);
  });

  it('rejects a submission faster than 3 seconds', () => {
    expect(checkAntiBot('', Date.now() - 500)).toBe(false);
  });

  it('accepts an empty honeypot submitted after 3 seconds', () => {
    expect(checkAntiBot('', Date.now() - 5000)).toBe(true);
  });

  it('rejects a timestamp older than an hour (stale/replayed form)', () => {
    expect(checkAntiBot('', Date.now() - 1000 * 60 * 61)).toBe(false);
  });
});
