import type { Metadata } from "next";
import { DISCLAIMER } from "@/lib/nav";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner video="/videos/botanical-banner.mp4"
          eyebrow="THE FINE PRINT"
          title="Honest products,"
          accent="honestly described"
        />
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-20">
          <p className="mt-8 leading-relaxed text-muted">{DISCLAIMER}</p>
          <p className="mt-6 leading-relaxed text-muted">
            Our products are natural cosmetics and complementary products, made in
            small batches and described honestly. Individual experiences vary. If
            you have a medical condition, are pregnant or nursing, or take chronic
            medication, please speak to your healthcare practitioner before using
            any new product.
          </p>
        </div>
      </div>
    </div>
  );
}
