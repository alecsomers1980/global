"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/** Empties the basket once the shopper lands on the order-placed page. */
export default function ClearCart() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
