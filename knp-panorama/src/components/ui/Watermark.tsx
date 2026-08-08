/**
 * Faint escarpment silhouette sitting behind a section, echoing the reference
 * theme's mountain watermark.
 *
 * The parent section must be `relative overflow-hidden` for this to sit correctly.
 *
 * Anchored to the bottom rather than stretched to fill: a coarse ridge scaled
 * over a tall section reads as hard grey wedges cutting through the copy, which
 * is what a first pass produced. A finer ridge at low opacity reads as texture.
 */
export function Watermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%] w-full opacity-[0.05]"
    >
      <path
        fill="#141414"
        d="M0 220 L0 168 L64 150 L118 162 L176 128 L232 152 L286 116 L338 140 L392 104 L444 132
           L498 96 L556 124 L612 88 L664 118 L716 82 L772 112 L826 76 L880 108 L934 72 L988 104
           L1042 68 L1096 100 L1150 74 L1204 106 L1258 80 L1312 112 L1366 92 L1440 124 L1440 220 Z"
      />
      <path
        fill="#141414"
        opacity="0.6"
        d="M0 220 L0 196 L88 182 L164 192 L246 170 L322 188 L404 164 L482 184 L560 158 L638 180
           L716 154 L794 178 L872 152 L950 176 L1028 150 L1106 174 L1184 148 L1262 172 L1340 146
           L1440 170 L1440 220 Z"
      />
    </svg>
  );
}
