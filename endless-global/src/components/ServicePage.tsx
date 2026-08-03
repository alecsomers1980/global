import Hero from "@/components/Hero";
import Link from "next/link";
import type { ServiceData } from "@/lib/content";

export default function ServicePage({ data }: { data: ServiceData }) {
  return (
    <main>
      <Hero
        bgImage={data.hero.bgImage}
        titleTop={data.hero.titleTop}
        titleMain={data.hero.titleMain}
        subtitle={data.hero.subtitle}
        size="inner"
      />

      {/* INTRO */}
      <section className="bg-white py-16 md:py-24">
        <div className="eg-container grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="eyebrow">Our Services</span>
            <h2 className="section-title mt-4">{data.intro.heading}</h2>
            {data.intro.paragraphs.map((p, i) => (
              <p key={i} className="mt-4 text-muted leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <div>
            <img
              src={data.intro.image}
              alt={data.intro.heading}
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-section py-16 md:py-24">
        <div className="eg-container">
          <div className="text-center">
            <span className="eyebrow">The Process</span>
            <h2 className="section-title mt-4">{data.process.heading}</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.process.items.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-line shadow-sm hover:shadow-md transition"
              >
                <div className="h-10 w-10 rounded-full bg-brand text-white grid place-items-center font-bold text-sm">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-semibold text-brand uppercase text-sm tracking-wide">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white py-16 md:py-24">
        <div className="eg-container grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <img
              src={data.benefits.image}
              alt={data.benefits.heading}
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">Benefits</span>
            <h2 className="section-title mt-4">{data.benefits.heading}</h2>
            <ul className="mt-6 space-y-4">
              {data.benefits.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 flex-none text-brand"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-ink">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative min-h-[320px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/ServiceCTABanner.png")' }}
        />
        <div className="absolute inset-0 bg-brand/80" />
        <div className="relative z-10 eg-container text-center text-white">
          <p className="uppercase tracking-[0.2em] text-white/80 text-sm">
            Partner with Endless Global Point
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold uppercase">
            Invest, Grow, and Succeed Globally
          </h2>
          <Link
            href="/talk-to-us"
            className="btn-primary bg-white text-brand hover:bg-white/90 mt-6 inline-block"
          >
            Get Started →
          </Link>
        </div>
      </section>
    </main>
  );
}
