"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productSlug: string;
  name: string;
  sizeLabel: string;
  priceRetail: number;
  qty: number;
};

type CartState = {
  items: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
};

/**
 * localStorage can throw outright in a private window or where site data is
 * blocked, so every read and write is guarded — a cart that cannot persist
 * still has to work for the session.
 */
const safeStorage = createJSONStorage(() => {
  try {
    if (typeof window === "undefined") throw new Error("no window");
    window.localStorage.getItem("__probe");
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === line.variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === line.variantId ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...line, qty }] };
        }),

      remove: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),

      setQty: (variantId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "rehoboth-cart", storage: safeStorage }
  )
);

export function subtotalOf(items: CartLine[]): number {
  return items.reduce((sum, i) => sum + i.priceRetail * i.qty, 0);
}

export function countOf(items: CartLine[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}
