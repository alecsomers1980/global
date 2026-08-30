import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="grid items-stretch lg:grid-cols-[7fr_5fr]">
      <div className="flex flex-col justify-center px-6 py-16 md:px-16 lg:py-24">
        <div className="mb-7 flex items-center gap-4">
          <Image src="/brand/emblem-dark.png" alt="" width={260} height={247} className="h-10 w-auto opacity-80" />
          <span className="text-xs uppercase tracking-[0.2em] text-brand">Genesis 26:22</span>
        </div>

        <h1 className="font-display text-[44px] leading-[1.03] tracking-tight text-ink sm:text-6xl lg:text-[82px]">
          Room enough
          <br />
          to do it slowly.
        </h1>

        <p className="mt-7 max-w-[480px] text-[17px] leading-relaxed text-ink-soft">
          Five plants — artemisia, moringa, turmeric, rosemary and neem — grown,
          dried and packed at Rehoboth Farm, Low&rsquo;s Creek, Mpumalanga. 100%
          natural, one ingredient in the bottle.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href="/shop"
            className="flex min-h-[52px] items-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
          >
            Shop the range
          </Link>
          <Link href="/about" className="flex min-h-[44px] items-center gap-3 text-sm text-ink hover:text-brand">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="15" cy="15" r="14" />
              <path d="M12 10l9 5-9 5z" fill="currentColor" stroke="none" />
            </svg>
            Watch the mill
          </Link>
        </div>
      </div>

      <div className="relative min-h-[320px] lg:min-h-[660px]">
        <Image
          src="/products/rosemary-1600.webp"
          alt="Rehoboth rosemary capsules beside a sprig of fresh rosemary"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
