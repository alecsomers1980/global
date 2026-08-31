import Link from "next/link";

export function StockistBand() {
  return (
    <section className="mx-auto mt-20 max-w-[1440px] px-6 md:px-16">
      <div className="flex flex-col gap-7 bg-brand-night px-8 py-14 text-brand-ink md:flex-row md:items-center md:justify-between md:px-14">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl md:text-[34px]">Stock Rehoboth in your shop</h2>
          <p className="text-[15px] text-white/80">Wholesale from 10 units. Trade pricing on approval.</p>
        </div>
        <Link
          href="/stockists"
          className="flex min-h-[52px] w-fit items-center bg-brand-ink px-9 text-sm uppercase tracking-[0.06em] text-ink hover:bg-white"
        >
          Become a stockist
        </Link>
      </div>
    </section>
  );
}
