import type { Tour } from '@/types/tour';
import { TourCard } from '@/components/tours/TourCard';

interface TourGridProps {
  tours: Tour[];
  className?: string;
}

export function TourGrid({ tours, className }: TourGridProps) {
  if (tours.length === 0) return null;

  return (
    <div
      className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${
        className ?? ''
      }`.trim()}
    >
      {tours.map((tour) => (
        <TourCard key={tour.slug} tour={tour} />
      ))}
    </div>
  );
}
