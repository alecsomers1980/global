import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { Hero } from "@/components/home/Hero";
import { VideoBand } from "@/components/home/VideoBand";
import { RangeGrid } from "@/components/home/RangeGrid";
import { ProofBeats } from "@/components/home/ProofBeats";
import { StockistBand } from "@/components/home/StockistBand";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <VideoBand />
        <RangeGrid />
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
