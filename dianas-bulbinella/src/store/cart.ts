"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  variantId: string;
  title: string;
  price: number;
  salePrice: number | null;
  image: string;
  size: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      add: (item, qty = 1) => {
        const existing = get().items.find(
          (i) => i.variantId === item.variantId,
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i
            ),
            open: true,
          });
        } else {
          set({
            items: [...get().items, { ...item, qty }],
            open: true,
          });
        }
      },
      remove: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },
      setQty: (variantId, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((i) => i.variantId !== variantId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId ? { ...i, qty } : i
            ),
          });
        }
      },
      clear: () => set({ items: [], open: false }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "dianas-cart-v2",
    }
  )
);

export const useCart = useCartStore;

export const cartCount = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.qty, 0);

export const cartTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + (item.salePrice ?? item.price) * item.qty, 0);
