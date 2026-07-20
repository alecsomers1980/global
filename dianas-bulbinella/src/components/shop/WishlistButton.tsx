"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWishlist } from "@/store/wishlist";

/** Heart toggle. Sits inside a product Link, so clicks must not navigate. */
export default function WishlistButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const ids = useWishlist((s) => s.ids);
  const userId = useWishlist((s) => s.userId);
  const loaded = useWishlist((s) => s.loaded);
  const load = useWishlist((s) => s.load);
  const toggle = useWishlist((s) => s.toggle);

  useEffect(() => {
    load();
  }, [load]);

  const active = ids.includes(productId);

  const handleClick = (e: React.MouseEvent) => {
    // The card is wrapped in a <Link> — don't follow it.
    e.preventDefault();
    e.stopPropagation();
    if (loaded && !userId) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={active}
      className={`rounded-full bg-paper/85 backdrop-blur-sm p-2 shadow-sm transition-colors hover:bg-paper ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-amber" : "text-ink/60"}
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
