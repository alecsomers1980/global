import Image from "next/image";
import Link from "next/link";

export default function TrustedPartner() {
  return (
    <section className="relative min-h-[560px] flex items-center">
      <div className="absolute inset-0">
        <Image
          src="/images/home-1.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      <div className="relative z-10 el-container w-full grid lg:grid-cols-2 gap-8 py-20">
        <div className="hidden lg:block" />

        <div className="bg-ink/75 backdrop-blur-sm rounded-[12px] p-8 md:p-12 text-white max-w-xl lg:justify-self-end">
          <h2 className="font-heading font-bold text-3xl md:text-4xl leading-tight">
            Your trusted partner in travel
          </h2>
          <p className="text-white/75 mt-5 text-sm md:text-base">
            At Endless Luxury, we specialise in connecting clients with vehicles
            and services that match their moments. From discreet executive sedans
            to head-turning supercars, we curate only the finest options through
            our trusted network. Every arrangement is handled with care,
            discretion, and precision, ensuring that your journey is seamless
            from first enquiry to final destination.
          </p>
          <Link
            href="/who-we-are"
            className="inline-block mt-5 text-gold uppercase text-xs tracking-wide font-heading hover:underline"
          >
            Discover More →
          </Link>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <p className="text-gold font-heading font-bold text-4xl">20+</p>
              <p className="font-heading font-semibold mt-1">Premium Partners</p>
              <p className="text-white/60 text-xs mt-2">
                We work only with carefully selected providers, giving you access
                to the most trusted names in prestige transport.
              </p>
            </div>
            <div>
              <p className="text-gold font-heading font-bold text-4xl">100%</p>
              <p className="font-heading font-semibold mt-1">Client Satisfaction</p>
              <p className="text-white/60 text-xs mt-2">
                Every arrangement is handled with care and precision, earning us a
                flawless record of happy clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
