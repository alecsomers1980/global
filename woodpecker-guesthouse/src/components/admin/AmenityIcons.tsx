// One small line icon per curated room amenity — same minimal stroke style
// as src/components/site/DetailIcons.tsx (viewBox 24x24, stroke=currentColor,
// strokeWidth 1.5). "En-suite bathroom" reuses the existing BathIcon instead
// of duplicating it — see room-amenities.ts.

type Props = { className?: string };

export function BarFridgeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="18" y1="6" x2="18" y2="10" />
      <line x1="18" y1="14" x2="18" y2="18" />
    </svg>
  );
}

export function KettleIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <line x1="6" y1="8" x2="3" y2="6" />
      <circle cx="12" cy="4" r="1.5" />
    </svg>
  );
}

export function AirconIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="8" rx="1" />
      <path d="M5 15 q2 -2 4 0 t4 0" />
      <path d="M5 18 q2 -2 4 0 t4 0" />
      <path d="M5 21 q2 -2 4 0 t4 0" />
    </svg>
  );
}

export function FlatscreenTvIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="12" rx="1" />
      <line x1="12" y1="15" x2="12" y2="18" />
      <line x1="8" y1="19" x2="16" y2="19" />
    </svg>
  );
}

export function DstvIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 18 Q12 24 19 18" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GardenViewIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3 L14 7 L10 7 Z" />
      <path d="M12 6 L15 11 L9 11 Z" />
      <path d="M12 10 L17 16 L7 16 Z" />
      <line x1="12" y1="16" x2="12" y2="19" />
    </svg>
  );
}

export function CouchIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="7" rx="1" />
      <rect x="3" y="10" width="18" height="5" rx="1" />
      <line x1="5" y1="15" x2="5" y2="18" />
      <line x1="19" y1="15" x2="19" y2="18" />
    </svg>
  );
}

export function JacuzziIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="12" rx="4" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FanIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 12 Q16 10 20 12" />
      <path d="M12 12 Q10 17 8 19" />
      <path d="M12 12 Q14 7 16 5" />
    </svg>
  );
}

export function VerandaIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12 L12 4 L21 12" />
      <line x1="4" y1="12" x2="4" y2="20" />
      <line x1="20" y1="12" x2="20" y2="20" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

export function BalconyIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="3" y1="8" x2="3" y2="20" />
      <line x1="21" y1="8" x2="21" y2="20" />
      <line x1="9" y1="8" x2="9" y2="20" />
      <line x1="15" y1="8" x2="15" y2="20" />
    </svg>
  );
}

export function InterlinkingIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="7" width="6" height="10" rx="1" />
      <rect x="15" y="7" width="6" height="10" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

export function WifiIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 16 Q12 12 16 16" />
      <path d="M6 15 Q12 9 18 15" />
      <path d="M4 14 Q12 6 20 14" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SafeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="11" r="4" />
      <line x1="12" y1="6" x2="12" y2="7" />
    </svg>
  );
}

export function HairdryerIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="4" height="6" rx="1" />
      <rect x="6" y="6" width="12" height="8" rx="2" />
      <rect x="13" y="14" width="6" height="7" rx="1" />
    </svg>
  );
}

export function NonSmokingIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <rect x="8" y="15" width="8" height="3" rx="1" />
      <line x1="5" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export function MosquitoNetIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12 Q12 2 20 12" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

export function BraaiAreaIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4 C14 6 15 8 14 10 C13 12 11 12 10 10 C9 8 10 6 12 4 Z" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <line x1="6" y1="14" x2="6" y2="18" />
      <line x1="18" y1="14" x2="18" y2="18" />
    </svg>
  );
}
