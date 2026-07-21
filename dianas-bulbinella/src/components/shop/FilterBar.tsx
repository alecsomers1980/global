"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterBarProps {
  formats: string[];
  total: number;
}

export default function FilterBar({ formats, total }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(() => searchParams.get("q") || "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const internalUpdate = useRef(false);

  // Sync inputValue from external URL changes (e.g., clear button)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== inputValue) {
      setInputValue(q);
    }
    // intentionally not depending on inputValue to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update search params when inputValue changes (debounced)
  useEffect(() => {
    if (internalUpdate.current) {
      internalUpdate.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue) {
        params.set("q", inputValue);
      } else {
        params.delete("q");
      }
      internalUpdate.current = true;
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // only run when inputValue changes, not on every searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = !!(
    searchParams.get("q") ||
    searchParams.get("format") ||
    searchParams.get("price") ||
    searchParams.get("sort")
  );

  return (
    <div className="sticky top-[64px] z-30 bg-paper/95 backdrop-blur border-b border-line py-3 px-6 flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-forest"
        />
      </div>

      {/* Format */}
      <select
        value={searchParams.get("format") || ""}
        onChange={(e) => updateParam("format", e.target.value || null)}
        className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink"
      >
        <option value="">All formats</option>
        {formats.map((fmt) => (
          <option key={fmt} value={fmt}>
            {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
          </option>
        ))}
      </select>

      {/* Price */}
      <select
        value={searchParams.get("price") || ""}
        onChange={(e) => updateParam("price", e.target.value || null)}
        className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink"
      >
        <option value="">Any price</option>
        <option value="lt100">Under R100</option>
        <option value="100-300">R100 – R300</option>
        <option value="300-700">R300 – R700</option>
        <option value="gt700">Over R700</option>
      </select>

      {/* Sort */}
      <select
        value={searchParams.get("sort") || ""}
        onChange={(e) => updateParam("sort", e.target.value || null)}
        className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink"
      >
        <option value="">Featured</option>
        <option value="name">Name A–Z</option>
        <option value="asc">Price low–high</option>
        <option value="desc">Price high–low</option>
      </select>

      {/* Total */}
      <span className="text-sm text-muted ml-auto">{total} products</span>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-muted underline hover:text-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}
