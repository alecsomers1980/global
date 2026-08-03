import Image from "next/image";
import { showcase } from "@/data/site";

export default function ServicesShowcase() {
  return (
    <section className="relative min-h-[620px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/home-2.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-ink/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 el-container w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left side */}
        <div className="self-center">
          <h2 className="font-heading text-white font-bold text-4xl md:text-5xl leading-tight max-w-md">
            Make every moment unforgettable
          </h2>
          <p className="text-white/70 mt-5">
            From screen productions to milestone celebrations, we arrange vehicles
            that elevate the occasion
          </p>
        </div>

        {/* Right side: 2x2 grid of cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {showcase.map((item, idx) => (
            <div
              key={idx}
              className="bg-black/35 backdrop-blur-sm rounded-[10px] p-6 border border-white/10"
            >
              {/* Car outline icon */}
              <svg
                className="w-8 h-8 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="11" width="16" height="5" rx="1" />
                <rect x="6" y="8" width="4" height="3" rx="1" />
                <rect x="13" y="8" width="4" height="3" rx="1" />
                <circle cx="7" cy="16" r="1.5" />
                <circle cx="17" cy="16" r="1.5" />
              </svg>
              <h3 className="font-heading text-white font-semibold text-lg mt-4">
                {item.title}
              </h3>
              <p className="text-white/70 text-sm mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
