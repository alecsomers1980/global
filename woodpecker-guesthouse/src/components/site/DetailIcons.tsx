// Minimal line icons for the room detail "Details" box, same stroke style
// as FacilityIcons.tsx.

type Props = { className?: string };

export function GuestsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 4.5a3 3 0 0 1 0 5.8M20 20c0-2.8-2-5.1-4.7-5.8" />
    </svg>
  );
}

export function BedIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2M3 12V8a1 1 0 0 1 1-1h6v4" />
      <path d="M13 11h5a2 2 0 0 1 2 2" />
    </svg>
  );
}

export function RoomsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M12 4v16M3 12h18" />
    </svg>
  );
}

export function BathIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" />
      <path d="M6 12V6a2 2 0 0 1 3.5-1.3M4 19l-1 2M20 19l1 2" />
    </svg>
  );
}

export function AmenitiesIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}
