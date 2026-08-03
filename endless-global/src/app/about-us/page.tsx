import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Team from "@/components/about/Team";
import { aboutValues } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Founded in 2022, Endless Global Point is a global business matchmaking agency bridging businesses, individuals, investors, and governments across investment, trade, financial, and consulting services.",
  alternates: { canonical: "/about-us" },
};

export default function AboutPage() {
  return (
    <>
      <Hero
        bgImage="/images/aboutUsBanner.png"
        titleTop="Building Connections"
        titleMain="That Create Growth"
        subtitle="We're more than a consulting intermediary, we're your connection to trusted expertise across investment, finance, trade, and business strategy."
      />

      {/* Intro */}
      <section className="bg-white py-16 md:py-24">
        <div className="eg-container grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow">About Us</span>
            <h2 className="section-title mt-4">
              Connecting Business, Investors, and Opportunities Worldwide
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Founded in 2022, Endless Global Point is a global business
              matchmaking agency dedicated to bridging the gap between
              businesses, individuals, investors, and governments. We specialise
              in investment, trade, financial, and consulting services, helping
              our clients unlock new opportunities, expand their networks, and
              achieve sustainable growth.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              At Endless Global Point, we believe that success begins with the
              right connection. Our role is to serve as a safe, transparent, and
              effective connecting point, empowering businesses to thrive through
              strategic partnerships, informed investments, and expert guidance.
            </p>
            <Link href="/talk-to-us" className="btn-primary mt-8">
              Talk To Us →
            </Link>
          </div>
          <div>
            <img
              src="/images/Rectangle-6.png"
              alt="The Endless Global Point team collaborating"
              className="w-full rounded-xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Values / Vision / Mission */}
      <section className="bg-section py-16 md:py-24">
        <div className="eg-container">
          <div className="grid gap-8 md:grid-cols-3">
            {aboutValues.map((v) => (
              <div key={v.title} className="rounded-xl bg-white p-8 shadow-sm">
                <img
                  src={v.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-16 w-16 object-contain"
                />
                <h3 className="mt-4 text-xl font-semibold text-brand">
                  {v.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <Team />

      {/* Watch This Space */}
      <section className="bg-white py-16 md:py-24">
        <div className="eg-container max-w-3xl text-center">
          <span className="eyebrow">Looking Ahead</span>
          <h2 className="section-title mt-4">Watch This Space</h2>
          <p className="mt-4 leading-relaxed text-muted">
            While we are a growing company, our focus remains on building a
            strong foundation of trust, reliability, and performance.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            In the coming months, we will be adding client testimonials, case
            studies, and success stories that reflect the positive impact of our
            work.
          </p>
        </div>
      </section>
    </>
  );
}
