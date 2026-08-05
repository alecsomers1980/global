import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  colour: string;
  size: number;
  priceCents: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, qty = 1) => {
        const addQty = Math.max(1, qty);
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantId === item.variantId,
          );
          if (existingIndex !== -1) {
            const currentQty = state.items[existingIndex].qty;
            const newQty = Math.max(1, Math.min(20, currentQty + addQty));
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              qty: newQty,
            };
            return { items: updatedItems };
          } else {
            const qtyToAdd = Math.max(1, Math.min(20, addQty));
            const newItem: CartItem = { ...item, qty: qtyToAdd };
            return { items: [...state.items, newItem] };
          }
        });
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQty: (variantId, qty) => {
        const floored = Math.floor(qty);
        if (floored <= 0) {
          set((state) => ({
            items: state.items.filter(
              (item) => item.variantId !== variantId,
            ),
          }));
        } else {
          const clamped = Math.max(1, Math.min(20, floored));
          set((state) => ({
            items: state.items.map((item) =>
              item.variantId === variantId
                ? { ...item, qty: clamped }
                : item,
            ),
          }));
        }
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'caracal-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}