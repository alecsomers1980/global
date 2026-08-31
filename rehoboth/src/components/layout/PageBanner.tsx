import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The header band every secondary page opens with.
 *
 * The ground is the logo teal itself. White text on #6C8781 is only 3.9:1, so
 * a soft scrim runs from the left — the side the copy sits on — which lifts it
 * to about 6:1 without changing the colour you actually see. Same technique as
 * the home banner.
 *
 * The sprigs are the farm's own moringa and artemisia (see Botanicals), leaning
 * off the right edge so they never sit under the words.
 */
const LEAVES = [
  {
    src: "/brand/sprig-moringa.webp",
    w: 900,
    h: 1048,
    place: "-right-20 -top-24 w-[320px] sm:w-[420px] lg:w-[520px]",
    rotate: "rotate(158deg) scaleX(-1)",
    opacity: 0.26,
    blur: 0,
    delay: "0s",
  },
  {
    src: "/brand/sprig-artemisia.webp",
    w: 589,
    h: 587,
    place: "hidden sm:block right-[22%] -bottom-24 w-[240px] lg:w-[320px]",
    rotate: "rotate(-14deg)",
    opacity: 0.2,
    blur: 1,
    delay: "-7s",
  },
];

export function PageBanner({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  /** A node, not a string — several of these headings break across two lines. */
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-brand">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {LEAVES.map((leaf, i) => (
          <div key={i} className={`reh-leaf absolute ${leaf.place}`} style={{ transform: leaf.rotate }}>
            <Image
              src={leaf.src}
              alt=""
              width={leaf.w}
              height={leaf.h}
              sizes="520px"
              className="reh-leaf-drift h-auto w-full"
              style={{
                opacity: leaf.opacity,
                filter: leaf.blur ? `blur(${leaf.blur}px)` : undefined,
                animationDelay: leaf.delay,
              }}
            />
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, rgba(36,64,58,0.45) 0%, rgba(36,64,58,0.18) 45%, rgba(36,64,58,0) 78%)",
        }}
      />

      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16 md:py-20">
        {eyebrow && (
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-brand-ink">{eyebrow}</p>
        )}
        <h1 className="max-w-[18ch] font-display text-4xl leading-[1.08] text-white md:text-[56px]">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-white">{lead}</p>
        )}
      </div>
    </div>
  );
}
