// Premium hand-drawn logo mark — a woodpecker perched on a trunk, geometric
// and minimal, replacing the original site's illustrative teal clipart
// (wp-content/uploads/2022/06/round-logo.png). Same subject (the bird is
// recognizably a woodpecker, mid-peck, perched), redrawn to the "Elevated
// Woodpecker" palette so it reads as one brand system with the rest of the
// site instead of a leftover asset from the old one.
//
// `<LogoMark>` is the icon alone (used standalone + rasterized for favicons,
// see scripts/generate-favicons.mjs). `<Logo>` is the full lockup used in
// the header/footer. Both take a `dark` prop for use on dark backgrounds
// (the footer, the hero's transparent-on-scroll header state).

type MarkProps = {
  className?: string;
  dark?: boolean; // true = rendering on a dark/ink background (swap fill to sand)
  badge?: boolean; // true = draw the circular badge ring behind the mark
};

export function LogoMark({ className, dark = false, badge = false }: MarkProps) {
  const fg = dark ? "#d9c7a8" : "#2b2620";
  const bg = dark ? "#2b2620" : "#fcf9f4";
  return (
    <svg viewBox="0 0 140 140" className={className} role="img" aria-label="Woodpecker Guesthouse">
      {badge && <circle cx="70" cy="70" r="66" fill="none" stroke={fg} strokeWidth="1.5" />}
      <g fill={fg} stroke={fg}>
        <rect x="30" y="18" width="9" height="86" rx="4.5" />
        <path d="M46 78 L33 98 L52 92 Z" />
        <path d="M42 46 C 42 34 51 25 63 25 C 75 25 84 35 84 47 C 84 62 74 76 58 80 C 47 76 42 62 42 46 Z" />
        <path d="M82 40 L104 45 L82 51 Z" />
        <circle cx="72" cy="40" r="2.4" fill={bg} stroke="none" />
      </g>
      <path
        d="M58 22 L61 8 L65 21 M67 21 L71 7 L74 20"
        stroke="#c1662f"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  dark?: boolean;
};

export function Logo({ className, dark = false }: LogoProps) {
  const ink = dark ? "#fcf9f4" : "#2b2620";
  const sub = dark ? "#d9c7a8" : "#6b6255";
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark className="h-9 w-9 shrink-0" dark={dark} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-wide" style={{ color: ink }}>
          Woodpecker
        </span>
        <span className="text-[10px] font-medium tracking-[0.3em]" style={{ color: sub }}>
          GUEST HOUSE
        </span>
      </span>
    </span>
  );
}
