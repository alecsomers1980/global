import React from 'react';
import Link from 'next/link';

type SectionHeaderProps = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel = 'View All',
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-10 gap-6">
      <h2 className="text-2xl md:text-3xl tracking-wide2">{title}</h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="shrink-0 text-xs uppercase tracking-wide3 text-amber-text hover:text-ink"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
