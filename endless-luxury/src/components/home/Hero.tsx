import Image from "next/image";
import EnquiryForm from "./EnquiryForm";

export default function Hero() {
  return (
    <section className="relative min-h-[720px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/homeBanner.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/20" />
      </div>

      <div className="relative z-10 el-container w-full pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left column */}
          <div>
            <span className="el-eyebrow text-gold mb-4 block">ARRIVE WITHOUT COMPROMISE</span>
            <h1 className="font-heading text-white font-bold text-4xl md:text-6xl leading-[1.1] mt-4 max-w-xl">
              Exceptional Cars, Secured for You.
            </h1>
            <p className="text-white/80 mt-5 text-lg">
              Arrive without compromise.
            </p>
          </div>

          {/* Right column */}
          <div className="flex justify-start lg:justify-end">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
