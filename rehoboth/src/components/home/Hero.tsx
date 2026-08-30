import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

/**
 * Full-bleed banner.
 *
 * The two entrance animations mirror the reference banner exactly: the copy
 * column runs fadeInLeft and the bottle runs fadeInUp, both 1.25s ease. Both
 * are pure CSS (see globals.css) so they fire on first paint rather than
 * waiting for hydration, and the global prefers-reduced-motion rule collapses
 * them to their end state.
 *
 * The header is rendered inside the section so it sits over the dark ground
 * instead of butting against it.
 */
export function Hero() {
  return (
    <section className="relative isolate flex w-full flex-col overflow-hidden bg-[#10201C] lg:min-h-[740px]">
      {/* ground: a soft vertical lift, so the band is not a flat fill */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, #16302A 0%, #10201C 45%, #0C1916 100%)",
        }}
      />
      {/* glow behind the bottle */}
      <div
        aria-hidden
        className="absolute -z-10 hidden lg:block"
        style={{
          right: "6%",
          top: "8%",
          width: "620px",
          height: "620px",
          background:
            "radial-gradient(circle, rgba(124,178,160,0.22) 0%, rgba(124,178,160,0.07) 45%, rgba(124,178,160,0) 70%)",
        }}
      />

      <Header tone="dark" />

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-6 px-6 pb-12 pt-6 md:gap-10 md:px-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-20 lg:pt-4">
        <div className="reh-in-left flex flex-col">
          <div className="mb-7 flex items-center gap-4">
            <Image
              src="/brand/emblem-light.png"
              alt=""
              width={260}
              height={247}
              className="h-9 w-auto opacity-90"
            />
            <span className="text-xs uppercase tracking-[0.2em] text-[#9CCBBA]">
              Genesis 26:22
            </span>
          </div>

          <h1 className="font-display text-[42px] leading-[1.04] tracking-tight text-[#F3FFF8] sm:text-6xl lg:text-[76px]">
            Room enough
            <br />
            to do it slowly.
          </h1>

          <p className="mt-6 max-w-[470px] md:mt-7 text-[17px] leading-relaxed text-white/70">
            Five plants — artemisia, moringa, turmeric, rosemary and neem — grown,
            dried and packed at Rehoboth Farm, Low&rsquo;s Creek, Mpumalanga. 100%
            natural, one ingredient in the bottle.
          </p>

          <div className="mt-8 flex flex-wrap md:mt-10 items-center gap-4">
            <Link
              href="/shop"
              className="flex min-h-[54px] items-center rounded-full bg-[#F3FFF8] px-9 text-sm uppercase tracking-[0.06em] text-[#12251F] transition-colors hover:bg-white"
            >
              Shop the range
            </Link>
            <Link
              href="/about"
              className="flex min-h-[54px] items-center gap-3 rounded-full border border-white/25 px-8 text-sm text-white/90 transition-colors hover:border-white/60 hover:text-white"
            >
              <svg width="22" height="22" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="15" cy="15" r="14" />
                <path d="M12 10l9 5-9 5z" fill="currentColor" stroke="none" />
              </svg>
              Our story
            </Link>
          </div>
        </div>

        <div className="reh-in-up relative flex justify-center lg:justify-end">
          <Image
            src="/brand/hero-bottle.webp"
            alt="Rehoboth Moringa Oleifera capsules"
            width={780}
            height={900}
            priority
            sizes="(max-width: 1024px) 70vw, 40vw"
            className="h-auto max-h-[540px] w-[190px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:w-[260px] lg:w-[380px]"
          />
        </div>
      </div>
    </section>
  );
}
