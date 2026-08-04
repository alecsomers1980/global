import type { ProductVariant } from './supabase/types';

export type StockState = 'in_stock' | 'low_stock' | 'sold_out' | 'unavailable';

const LOW_STOCK_THRESHOLD = 4; // quantities below this (but >0) are considered low stock

export function variantStockState(v: ProductVariant | undefined): StockState {
  if (!v || !v.active) {
    return 'unavailable';
  }
  if (v.stock_qty === 0) {
    return 'sold_out';
  }
  if (v.stock_qty < LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }
  return 'in_stock';
}