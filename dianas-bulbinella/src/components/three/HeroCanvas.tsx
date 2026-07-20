"use client";

import dynamic from "next/dynamic";

/** Poster shown while the 3D bundle loads (and as the SSR placeholder) —
 *  a soft amber-on-green botanical glow so first paint already looks designed. */
function Poster() {
  return (
    <div
      className="absolute inset-0 rounded-3xl"
      style={{
        background:
          "radial-gradient(60% 55% at 55% 40%, rgba(192,132,42,0.28) 0%, rgba(46,90,65,0.12) 45%, transparent 75%)",
      }}
    />
  );
}

const BotanicalScene = dynamic(() => import("./BotanicalScene"), {
  ssr: false,
  loading: () => <Poster />,
});

/** Fills its (relatively positioned) parent. 3D never blocks first paint. */
export default function HeroCanvas() {
  return (
    <div className="absolute inset-0">
      <Poster />
      <div className="absolute inset-0">
        <BotanicalScene />
      </div>
    </div>
  );
}
