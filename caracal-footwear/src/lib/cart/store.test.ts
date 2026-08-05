import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, cartSubtotalCents, cartItemCount } from './store';

const tan9 = {
  variantId: 'v-tan-9',
  productSlug: 'classic-chukka',
  productName: 'Classic Chukka',
  colour: 'Tan',
  size: 9,
  priceCents: 55000,
};

const black10 = {
  variantId: 'v-black-10',
  productSlug: 'classic-chukka',
  productName: 'Classic Chukka',
  colour: 'Black',
  size: 10,
  priceCents: 55000,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('addItem', () => {
  it('adds a new line at qty 1 by default', () => {
    useCartStore.getState().addItem(tan9);
    expect(useCartStore.getState().items).toEqual([{ ...tan9, qty: 1 }]);
  });

  it('increments qty when the same variant is added again', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(tan9, 2);
    expect(useCartStore.getState().items).toEqual([{ ...tan9, qty: 3 }]);
  });

  it('keeps different variants as separate lines', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(black10);
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('updateQty', () => {
  it('sets the quantity for a line', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 5);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('clamps quantity to the 1-20 range', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 999);
    expect(useCartStore.getState().items[0].qty).toBe(20);
  });

  it('removes the line when qty drops to zero or below', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('removeItem', () => {
  it('removes only the matching line', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(black10);
    useCartStore.getState().removeItem(tan9.variantId);
    expect(useCartStore.getState().items).toEqual([{ ...black10, qty: 1 }]);
  });
});

describe('clear', () => {
  it('empties the cart', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe('cartSubtotalCents', () => {
  it('sums price times quantity across lines', () => {
    const items = [{ ...tan9, qty: 2 }, { ...black10, qty: 1 }];
    expect(cartSubtotalCents(items)).toBe(55000 * 2 + 55000);
  });

  it('is zero for an empty cart', () => {
    expect(cartSubtotalCents([])).toBe(0);
  });
});

describe('cartItemCount', () => {
  it('sums quantities, not line count', () => {
    const items = [{ ...tan9, qty: 2 }, { ...black10, qty: 3 }];
    expect(cartItemCount(items)).toBe(5);
  });
});
