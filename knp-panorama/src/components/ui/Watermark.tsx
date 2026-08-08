{/* Parent section must be relative and overflow-hidden */}
export function Watermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.045]"
    >
      <path
        fill="#141414"
        d="M0,400 L0,300 L200,250 L400,320 L600,200 L800,280 L1000,180 L1200,260 L1440,220 L1440,400 Z"
      />
    </svg>
  );
}
