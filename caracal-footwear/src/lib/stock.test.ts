import { describe, it, expect } from 'vitest';
import { variantStockState } from './stock';
import type { ProductVariant } from './supabase/types';

function variant(over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'v1',
    product_id: 'p1',
    colour_name: 'Tan',
    colour_hex: '#B5763A',
    size: 9,
    sku: null,
    stock_qty: 10,
    price_override: null,
    active: true,
    ...over,
  };
}

describe('variantStockState', () => {
  it('reports in_stock above the low threshold', () => {
    expect(variantStockState(variant({ stock_qty: 10 }))).toBe('in_stock');
  });

  it('reports in_stock just above the low threshold', () => {
    expect(variantStockState(variant({ stock_qty: 4 }))).toBe('in_stock');
  });

  it('reports low_stock at or below three', () => {
    expect(variantStockState(variant({ stock_qty: 3 }))).toBe('low_stock');
    expect(variantStockState(variant({ stock_qty: 1 }))).toBe('low_stock');
  });

  it('reports sold_out at zero', () => {
    expect(variantStockState(variant({ stock_qty: 0 }))).toBe('sold_out');
  });

  it('reports unavailable for an inactive variant even with stock', () => {
    expect(variantStockState(variant({ active: false, stock_qty: 10 }))).toBe(
      'unavailable',
    );
  });

  it('reports unavailable when the combination does not exist', () => {
    expect(variantStockState(undefined)).toBe('unavailable');
  });
});
