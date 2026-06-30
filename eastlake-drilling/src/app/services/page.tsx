import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { services } from "@/lib/content";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import ParallaxBanner from "@/components/ParallaxBanner";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Borehole Services in Johannesburg & Gauteng – East Lake Drilling",
  description:
    "Expert borehole drilling, pump installation, water filtration, water testing, treatment and off-grid solar services across Johannesburg and Gauteng. East Lake Drilling – trusted borehole specialists.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Complete borehole & water solutions"
        subtitle="Everything from drilling and pumps to filtration, water testing, treatment and off-grid solar — across Johannesburg and Gauteng."
        image="/images/hero/banner-3.jpg"
      />

      <section className="container-px py-20">
        <div className="space-y-20">
          {services.map((service, index) => {
            const reverse = index % 2 === 1;
            return (
              <div
                key={service.slug}
                className="grid grid-cols-1 gap-10 items-center md:grid-cols-2"
              >
                {/* Image side */}
                <div
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md ${
                    reverse ? "order-1 md:order-2" : "order-1"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Text side */}
                <div
                  className={`${
                    reverse ? "order-2 md:order-1" : "order-2"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand grid place-items-center">
                    <Icon name={service.icon} className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mt-3">
                    {service.title}
                  </h2>
                  <p className="text-ink/70 leading-relaxed mt-3">
                    {service.body}
                  </p>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex gap-2 text-sm">
                        <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1 text-brand font-medium mt-5"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ParallaxBanner
        image="/images/parallax/water-blue.jpg"
        eyebrow="One Team, Start to Finish"
        title="From the first survey to clean water at the tap"
        subtitle="We handle drilling, pumps, storage, testing, treatment and solar — so you deal with one accountable team, not five."
        cta={{ label: "Request a Quote", href: "/contact" }}
        height="sm"
      />

      <CTASection />
    </>
  );
}