import { Clock, MapPin } from 'lucide-react';

interface TourMetaProps {
  duration: string;
  location: string;
  className?: string;
  tone?: 'dark' | 'light';
}

export function TourMeta({
  duration,
  location,
  className,
  tone = 'dark',
}: TourMetaProps) {
  const textColor =
    tone === 'light' ? 'text-white/80' : 'text-text/70';

  return (
    <div
      className={`space-y-1 text-xs ${textColor} ${className ?? ''}`.trim()}
    >
      <div className="flex items-center gap-1.5">
        <Clock size={14} />
        <span>{duration}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MapPin size={14} />
        <span>{location}</span>
      </div>
    </div>
  );
}
