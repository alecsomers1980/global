"use client";

import dynamic from "next/dynamic";
import { type Dealer } from "@/lib/dealer-types";

const DealerMap = dynamic(() => import("./DealerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-3xl bg-surface-2 md:h-[520px]" />
  ),
});

export default function DealerMapSection({ dealers }: { dealers: Dealer[] }) {
  const pins = dealers.filter((d) => d.latitude != null && d.longitude != null);

  if (pins.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-ink mb-4">
        On the map
        <span className="text-sm text-muted ml-2">{pins.length} located</span>
      </h2>
      <DealerMap dealers={dealers} />
    </div>
  );
}
