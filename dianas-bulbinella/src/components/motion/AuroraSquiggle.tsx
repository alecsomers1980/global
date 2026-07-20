"use client";

/**
 * Full-page ambient background for the Aurae Glow homepage:
 * soft aurora gradient blobs + a gold squiggly line that draws itself
 * as you scroll (Flavoury-style). Position: absolute inset-0 behind
 * content inside a `relative` page wrapper. Pointer-events: none.
 */
import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const HOME_PATH = `M -60 320
   C 260 420, 520 260, 640 520
   S 400 980, 620 1150
   S 1120 1240, 1010 1520
   S 420 1650, 380 1950
   S 900 2160, 940 2450
   S 300 2680, 330 2980
   S 1000 3160, 1010 3460
   S 420 3700, 520 3980
   S 980 4120, 1260 4060`;

const PAGE_PATH = `M -60 180
   C 280 300, 560 160, 660 420
   S 380 760, 600 940
   S 1100 1020, 980 1300
   S 420 1420, 520 1620`;

export default function AuroraSquiggle({
  variant = "home",
}: {
  variant?: "home" | "page";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const home = variant === "home";
  // Page variant: the svg is a fixed 1800px band at the top (tall pages like
  // /shop would otherwise stretch the path invisible), so finish the draw
  // within the first ~35% of scroll.
  const drawn = useTransform(scrollYProgress, [0, home ? 0.95 : 0.35], [0, 1]);
  const pathLength = useSpring(drawn, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });
  const gradId = home ? "squiggleGradHome" : "squiggleGradPage";

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* aurora blobs — sage, gold, plus warmer flower tones (peach, lilac) */}
      <div
        className="absolute -top-40 right-[-15%] h-[720px] w-[720px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(243,220,168,.55), rgba(203,231,208,.35) 55%, transparent 75%)",
        }}
      />
      <div
        className="absolute left-[-20%] top-[26%] h-[640px] w-[640px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(203,231,208,.6), rgba(250,205,180,.35) 60%, transparent 78%)",
        }}
      />
      {home && (
        <>
          <div
            className="absolute right-[-10%] top-[58%] h-[560px] w-[560px] rounded-full opacity-55 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(250,205,180,.5), rgba(243,220,168,.3) 55%, transparent 75%)",
            }}
          />
          <div
            className="absolute left-[-8%] bottom-[-6%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(216,196,232,.5), rgba(203,231,208,.35) 60%, transparent 78%)",
            }}
          />
        </>
      )}

      {/* scroll-drawn squiggle */}
      <svg
        className={
          home
            ? "absolute inset-x-0 top-0 h-full w-full"
            : "absolute inset-x-0 top-0 h-[1800px] max-h-full w-full"
        }
        viewBox={home ? "0 0 1200 4200" : "0 0 1200 1700"}
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d={home ? HOME_PATH : PAGE_PATH}
          stroke={`url(#${gradId})`}
          strokeWidth={10.5}
          strokeLinecap="round"
          style={reduced ? undefined : { pathLength }}
          initial={reduced ? undefined : { pathLength: 0 }}
        />
        <defs>
          {/* Logo green (#4B962F sampled from the BULBINELLA lettering) */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4B962F" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#3B7A24" stopOpacity="0.45" />
            <stop offset="1" stopColor="#4B962F" stopOpacity="0.55" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
