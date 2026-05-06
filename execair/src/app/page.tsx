import Hero from "@/components/Hero";
import UniqueProjects from "@/components/UniqueProjects";
import ThreeStepApproach from "@/components/ThreeStepApproach";
import CompanyDescription from "@/components/CompanyDescription";
import ClientLogos from "@/components/ClientLogos";
import PartnerLogos from "@/components/PartnerLogos";
import Workmanship from "@/components/Workmanship";
import Testimonials from "@/components/Testimonials";
import BottomCTA from "@/components/BottomCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <UniqueProjects />
      <ThreeStepApproach />
      <CompanyDescription />
      <ClientLogos />
      <PartnerLogos />
      <Workmanship />
      <Testimonials />
      <BottomCTA />
    </>
  );
}
