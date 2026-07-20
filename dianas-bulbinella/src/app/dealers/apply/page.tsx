import type { Metadata } from "next";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import DealerApplicationForm from "@/components/site/DealerApplicationForm";

export const metadata: Metadata = {
  title: "Become a Dealer – Diana's Bulbinella",
  description: "Apply to become an authorised Dianas Bulbinella agent.",
};

export default function ApplyDealerPage() {
  return (
    <>
      <AuroraSquiggle variant="page" />
      <PageBanner
        video="/videos/lavender-banner.mp4"
        eyebrow="DEALERS"
        title="Become a"
        accent="dealer"
        subtitle="Share the range in your own town."
      />
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <p className="text-muted text-center mb-10 leading-relaxed">
          Diana&apos;s Bulbinella works with passionate individuals who love natural skincare and
          want to bring the glow to their communities. Fill in the form and Diana will get back to
          you to discuss the next steps.
        </p>
        <DealerApplicationForm />
      </div>
    </>
  );
}
