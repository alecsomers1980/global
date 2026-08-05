import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/products';
import { formatZAR } from '@/lib/money';

/**
 * Homepage. The cinematic nine-beat version lands in Phase 4; this is the
 * hero beat only, built on the client's own photography.
 */
export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden">
      {/*
        The photo is 1600x900 upscaled from a 1280px original, so it is soft at
        desktop widths. The overlay and the grain carry it; a proper hero frame
        or a short reel from the client would replace this file alone.
      */}
      {/*
        object-left on small screens: a centre crop of this frame is all lit
        toe, and the body copy then sits on the brightest part of the photo.
        The left edge is dark foliage and boot shaft.
      */}
      <div className="absolute inset-0">
        <Image
          src="/hero/wild-by-nature.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="hero-drift object-cover object-left md:object-center"
        />
      </div>

      {/*
        Two overlays, not one. The wash buys contrast for the type -- vertical
        on mobile, where the text stacks over the middle of the frame, and
        horizontal on desktop, which keeps the lit shoe on the right readable.
        The second blends the photo into the page below it.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/80 to-canvas/40 md:bg-gradient-to-r md:via-canvas/85 md:to-canvas/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">
          Caracal Footwear
        </p>

        <h1 className="display mt-5 text-6xl text-text sm:text-7xl lg:text-8xl">
          Wild by
          <br />
          Nature
        </h1>

        <div className="mt-7 max-w-md space-y-4 text-muted">
          <p>
            Handcrafted vellies in genuine leather, on a non-slip TPR sole.
            Built to last.
          </p>
          <p>
            Sizes 4 to 15. Made to order in {settings.lead_time}. Free delivery
            on orders over {formatZAR(Number(settings.delivery_free_threshold))}.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/range"
            className="rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi"
          >
            Shop the range
          </Link>
          <Link
            href="/signature"
            className="rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
          >
            Signature Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
