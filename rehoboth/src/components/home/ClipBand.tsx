"use client";

import { useReducedMotion } from "framer-motion";

/**
 * A single clip from the client's farm video, used as a section divider.
 * Under prefers-reduced-motion the poster frame stands in, so the page still
 * reads with no movement at all.
 */
export function ClipBand({
  clip,
  caption,
  alt,
  height = "h-[300px] md:h-[420px]",
  focus = "center",
}: {
  clip: string;
  caption?: string;
  alt: string;
  height?: string;
  /** object-position, for clips whose subject is not centred in frame. */
  focus?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <figure className={`relative overflow-hidden bg-dark-band ${height}`}>
      {reduced ? (
        <img
          src={`/video/${clip}.jpg`}
          alt={alt}
          className="h-full w-full object-cover opacity-80"
          style={{ objectPosition: focus }}
        />
      ) : (
        <video
          className="h-full w-full object-cover opacity-80"
          style={{ objectPosition: focus }}
          src={`/video/${clip}.mp4`}
          poster={`/video/${clip}.jpg`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={alt}
        />
      )}
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(16,32,28,0.9)] to-transparent px-6 pb-7 pt-16 text-center text-sm text-white/85 md:px-16">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
