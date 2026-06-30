import { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import ParallaxBanner from "@/components/ParallaxBanner";
import { boreholeIntro, boreholeSteps } from "@/lib/content";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Boreholes – East Lake Drilling",
  description:
    "Learn what a borehole is, how it works, and how we install them. East Lake Drilling, South Africa.",
};

export default function BoreholesPage() {
  return (
    <>
      <PageHero
        eyebrow="Boreholes"
        title="Understanding your borehole"
        subtitle="From what a borehole is to how water gets to your tap."
        image="/images/hero/borehole-15.jpg"
      />

      {/* What is a borehole */}
      <section className="container-px py-20">
        <SectionHeading title={boreholeIntro.what.title} />
        <p className="mt-6 text-ink/70 leading-relaxed max-w-3xl mx-auto text-center">
          {boreholeIntro.what.body}
        </p>
      </section>

      {/* Yield section with image */}
      <section className="container-px py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1">
            <SectionHeading title={boreholeIntro.yield.title} />
            <p className="mt-4 text-ink/70 leading-relaxed">
              {boreholeIntro.yield.body}
            </p>
          </div>
          <div className="flex-1 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/hero/borehole-15.jpg"
              alt="Borehole yield illustration"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <ParallaxBanner
        image="/images/parallax/water-stream.jpg"
        eyebrow="Drilled Deep"
        title="Up to 150 m deep, 60–70 m a day"
        subtitle="The average Highveld borehole runs 60–80 m. Our compact rig reaches tight sites and drills cleanly through hard rock."
        height="sm"
      />

      {/* Installation process */}
      <section className="bg-white py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="How It Works"
            title="How a borehole is installed"
          />
          <div className="mt-12 max-w-3xl mx-auto relative">
            {/* Vertical timeline line */}
            <div className="absolute left-0 top-0 h-full border-l-2 border-brand/30" />
            <ol className="space-y-8">
              {boreholeSteps.map((step, idx) => (
                <li key={idx} className="relative pl-10">
                  {/* Number badge */}
                  <span className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold shadow">
                    {idx + 1}
                  </span>
                  <p className="text-ink/80 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}