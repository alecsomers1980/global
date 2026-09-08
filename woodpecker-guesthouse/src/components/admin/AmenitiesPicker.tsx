"use client";

import { AMENITIES } from "@/lib/room-amenities";

export default function AmenitiesPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggleAmenity = (label: string) => {
    if (value.includes(label)) {
      onChange(value.filter((item) => item !== label));
    } else {
      onChange([...value, label]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {AMENITIES.map((amenity) => {
        const isSelected = value.includes(amenity.label);
        return (
          <label
            key={amenity.key}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              isSelected
                ? "border-terracotta bg-terracotta/5 text-ink"
                : "border-line text-muted"
            }`}
          >
            <input
              type="checkbox"
              className="accent-terracotta"
              checked={isSelected}
              onChange={() => toggleAmenity(amenity.label)}
            />
            <amenity.Icon className="h-4 w-4" />
            <span>{amenity.label}</span>
          </label>
        );
      })}
    </div>
  );
}
