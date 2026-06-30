import { aboutText, services } from "@/lib/content";
import CTASection from "@/components/CTASection";
import Sectors from "@/components/Sectors";
import SectionHeading from "@/components/SectionHeading";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceCard from "@/components/ServiceCard";
import StatsBand from "@/components/StatsBand";
import VideoHero from "@/components/VideoHero";
import WhyChooseUs from "@/components/WhyChooseUs";
import ParallaxBanner from "@/components/ParallaxBanner";
import { Check } from "lucide-react";
import Image from "next/image";

const highlights = [
  "One-stop-shop — drilling, pumps, filtration & solar",
  "Compact rig that accesses tight suburban sites",
  "Fully compliant with the OHS Act",
];

export default function HomePage() {
  return (
    <>
      <VideoHero
        eyebrow="Your Borehole Specialists"
        title="Reliable borehole water, from survey to your tap"
        subtitle="Drilling, pumps, filtration, water testing and off-grid solar — a one-stop borehole service for homes and businesses across Johannesburg and Gauteng."
      />

      <StatsBand />

      <section className="container-px py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="About Us"
              title="Your borehole specialists in Gauteng"
            />
            <p className="mt-4 leading-relaxed text-ink/70">{aboutText}</p>
            <ul className="mt-6 space-y-3">
              {highlights.map((text) => (
                <li key={text} className="flex gap-3">
                  <Check className="text-brand" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/images/hero/borehole-15.jpg"
              alt="East Lake Drilling borehole drilling on site"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="What We Do"
            title="Complete borehole & water solutions"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard
                key={s.slug}
                slug={s.slug}
                number={s.number}
                title={s.title}
                short={s.short}
                icon={s.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <ParallaxBanner
        image="/images/parallax/water-blue.jpg"
        eyebrow="Water Independence"
        title="Stop relying on the municipal grid"
        subtitle="A borehole gives your home or business its own secure, cost-saving water supply — right through water shedding and outages."
        cta={{ label: "Get a Free Quote", href: "/contact" }}
      />
      <Sectors />
      <ServiceAreas />
      <CTASection />
    </>
  );
}