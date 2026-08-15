// Minimal line icons for the facilities band, replacing the old generic
// blue-gradient clipart (flaticon-style stock icons) with marks in the same
// stroke-based style as the rest of the site's iconography. `currentColor`
// so they inherit the section's text color (white on the dark band).

type Props = { className?: string };

export function PoolIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="6" r="2.25" />
      <path d="M2 14c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
      <path d="M2 19c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
    </svg>
  );
}

export function BraaiIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6c-1-1.5-.5-3 .5-4M12 6c-1-1.5-.5-3 .5-4M15 6c-1-1.5-.5-3 .5-4" />
      <ellipse cx="12" cy="10" rx="7" ry="2.25" />
      <path d="M5 10c0 3 3 4 7 4s7-1 7-4" />
      <path d="M8 14l-2 6M16 14l2 6" />
    </svg>
  );
}

export function JumpingCastleIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20V11a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1 4-4 4 4 0 0 1 4 4v9" />
      <path d="M9 20v-6a3 3 0 0 1 6 0v6" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function ParkingIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </svg>
  );
}
