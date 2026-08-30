import Image from "next/image";

/**
 * Decorative sprigs behind the banner content.
 *
 * The two cutouts are the farm's own moringa and artemisia, keyed out of the
 * client's plate shots by `scripts/cut-botanicals.mjs` — not stock leaves.
 * They sit at low opacity with a long drift so the banner has depth without
 * competing with the headline; the far ones are blurred to sit back.
 */
const LEAVES = [
  {
    src: "/brand/sprig-moringa.webp",
    w: 900,
    h: 1048,
    // top-left, bleeding off both edges
    place: "-left-24 -top-28 w-[300px] sm:w-[420px] lg:w-[620px]",
    rotate: "rotate(-10deg)",
    opacity: 0.17,
    blur: 0,
    delay: "0s",
  },
  {
    src: "/brand/sprig-moringa.webp",
    w: 900,
    h: 1048,
    // bottom-right, mirrored so the two sprigs do not read as a repeat
    place: "-right-36 -bottom-44 w-[340px] sm:w-[460px] lg:w-[640px]",
    rotate: "rotate(152deg) scaleX(-1)",
    opacity: 0.16,
    blur: 0,
    delay: "-6s",
  },
  {
    src: "/brand/sprig-artemisia.webp",
    w: 589,
    h: 587,
    place: "hidden lg:block left-[3%] -bottom-16 w-[480px]",
    rotate: "rotate(12deg)",
    opacity: 0.16,
    blur: 0.5,
    delay: "-11s",
  },
  {
    src: "/brand/sprig-artemisia.webp",
    w: 589,
    h: 587,
    place: "hidden md:block right-[26%] -top-24 w-[220px] lg:w-[280px]",
    rotate: "rotate(-155deg)",
    opacity: 0.12,
    blur: 1.5,
    delay: "-3s",
  },
];

export function Botanicals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {LEAVES.map((leaf, i) => (
        <div
          key={i}
          className={`reh-leaf absolute ${leaf.place}`}
          style={{ transform: leaf.rotate }}
        >
          <Image
            src={leaf.src}
            alt=""
            width={leaf.w}
            height={leaf.h}
            sizes="640px"
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
  );
}
