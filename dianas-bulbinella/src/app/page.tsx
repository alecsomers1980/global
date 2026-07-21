import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import Hero from "@/components/home/Hero";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import ConcernTiles from "@/components/home/ConcernTiles";
import VideoBanner from "@/components/home/VideoBanner";
import SpecialsShowcase from "@/components/home/SpecialsShowcase";
import RangeShowcase from "@/components/home/RangeShowcase";
import FounderStory from "@/components/home/FounderStory";
import NewsletterCta from "@/components/home/NewsletterCta";
import HomePopup from "@/components/home/HomePopup";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Natural South African Skincare & Wellness",
  description: "250+ handmade botanical products for skin, body and everyday wellness — small batches from White River, honestly described since 2012.",
};

export default async function HomePage() {
  // Popup is home-page only, and self-limits to once per 30 days per browser.
  const settings = await getSiteSettings();

  return (
    <div className="relative">
      <AuroraSquiggle />
      {settings.popupEnabled && settings.popupImage && (
        <HomePopup
          image={settings.popupImage}
          alt={settings.popupAlt}
          link={settings.popupLink}
        />
      )}
      <div className="relative z-10">
        <Hero />
        <MarqueeStrip />
        <ConcernTiles />
        <VideoBanner />
        <SpecialsShowcase />
        <RangeShowcase />
        <FounderStory />
        <NewsletterCta />
      </div>
    </div>
  );
}
