'use client';

import { useCartStore, cartItemCount } from '@/lib/cart/store';

export default function CartBadge() {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <>
      <span className="sr-only">, {count} items</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-canvas text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </>
  );
}