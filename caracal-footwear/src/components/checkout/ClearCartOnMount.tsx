'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

/** Only ever rendered by the success page when an order is confirmed `paid`
 *  -- the cart must survive a cancelled or still-pending checkout. */
export default function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
