"use client";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface WishlistState {
  ids: string[];
  loaded: boolean;
  loading: boolean;
  userId: string | null;
  /** Load the signed-in user's wishlist once (no-op for guests / repeats). */
  load: () => Promise<void>;
  /** Optimistically toggle, then sync to Supabase. */
  toggle: (productId: string) => Promise<void>;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: [],
  loaded: false,
  loading: false,
  userId: null,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ ids: [], userId: null, loaded: true, loading: false });
        return;
      }
      const { data } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id);
      set({
        ids: (data ?? []).map((r) => r.product_id as string),
        userId: user.id,
        loaded: true,
        loading: false,
      });
    } catch {
      set({ loaded: true, loading: false });
    }
  },

  toggle: async (productId) => {
    const { userId, ids } = get();
    if (!userId) return; // caller sends guests to /login
    const supabase = createClient();

    if (ids.includes(productId)) {
      set({ ids: ids.filter((i) => i !== productId) });
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      if (error) set({ ids: get().ids.concat(productId) }); // roll back
    } else {
      set({ ids: [...ids, productId] });
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: userId, product_id: productId });
      if (error) set({ ids: get().ids.filter((i) => i !== productId) }); // roll back
    }
  },
}));
