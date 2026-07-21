"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useWishlist } from "@/store/wishlist";
import { formatZAR } from "@/lib/catalog";

type WishlistItem = {
  product_id: string;
  products: {
    id: string;
    slug: string;
    title: string;
    format: string | null;
    product_variants: {
      id: string;
      size: string | null;
      price: number;
      image: string | null;
      sort_order: number;
    }[];
  } | null;
};

export default function WishlistPage() {
  const [supabase] = useState(() => createClient());
  // Select individually — destructuring the store would re-render on any change.
  const load = useWishlist((s) => s.load);
  const toggle = useWishlist((s) => s.toggle);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("wishlist_items")
      .select(
        "product_id, products(id, slug, title, format, product_variants(id, size, price, image, sort_order))"
      )
      .eq("user_id", user.id);

    if (data) {
      const filtered = (data as unknown as WishlistItem[]).filter(
        (item) => item.products
      );
      setItems(filtered);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load().then(() => fetchWishlist());
  }, [load, fetchWishlist]);

  const handleRemove = (productId: string) => {
    toggle(productId).then(() => {
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-line rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-line rounded-2xl aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-serif text-ink">My favourites</h1>

      {items.length === 0 ? (
        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm text-center space-y-4">
          <p className="text-muted">
            You haven’t saved any favourites yet.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const product = item.products!;
            // Copy before sorting — .sort() mutates, and this array is state.
            const variant = [...(product.product_variants ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            )[0];
            const image = variant?.image || "";
            const price = Number(variant?.price ?? 0);
            return (
              <div key={item.product_id} className="bg-paper border border-line rounded-2xl p-4 shadow-sm space-y-3">
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square rounded-2xl bg-white border border-line overflow-hidden">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.title}
                        fill
                        sizes="(max-width:640px) 50vw, 33vw"
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center text-muted text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-ink mt-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="text-xs text-muted mt-1">
                    {variant?.size ? `${variant.size} · ` : ""}
                    {formatZAR(price)}
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink hover:bg-surface-2 transition-colors"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
