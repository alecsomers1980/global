import Hero from "@/components/home/Hero";
import FleetCarousel from "@/components/home/FleetCarousel";
import TrustedPartner from "@/components/home/TrustedPartner";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import Faq from "@/components/home/Faq";

export default function Home() {
  return (
    <>
      <Hero />
      <FleetCarousel />
      <TrustedPartner />
      <WhyChooseUs />
      <ServicesShowcase />
      <Faq />
    </>
  );
}
