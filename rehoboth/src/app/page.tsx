import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { Hero } from "@/components/home/Hero";
import { VideoBand } from "@/components/home/VideoBand";
import { RangeGrid } from "@/components/home/RangeGrid";
import { ProofBeats } from "@/components/home/ProofBeats";
import { LatestNews } from "@/components/home/LatestNews";
import { StockistBand } from "@/components/home/StockistBand";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <VideoBand />
        <RangeGrid />
        <LatestNews />
        <ProofBeats />
        <StockistBand />
        <div className="mx-auto max-w-[1440px] px-6 pt-20 md:px-16">
          <DisclaimerBlock />
        </div>
      </main>
      <Footer />
    </>
  );
}
