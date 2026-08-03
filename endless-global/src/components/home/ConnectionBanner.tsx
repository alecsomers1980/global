import Link from "next/link";

export default function ConnectionBanner() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/Rectangle-9.png")' }}
      />
      <div className="absolute inset-0 bg-brand/85" />
      <div className="relative z-10 eg-container py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase leading-tight max-w-xl">
            Let&apos;s Make the Right Connection
          </h2>
          <p className="mt-3 text-white/85 max-w-lg">
            We&apos;ll match you with trusted experts in investment, finance,
            trade, and consulting.
          </p>
        </div>
        <Link
          href="/talk-to-us"
          className="btn-primary bg-white text-brand hover:bg-white/90 whitespace-nowrap"
        >
          Request a Consult →
        </Link>
      </div>
    </section>
  );
}
