import Hero from "@/components/Hero";
import About from "@/components/home/About";
import ConnectionBanner from "@/components/home/ConnectionBanner";
import ServicesGrid from "@/components/home/ServicesGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ProcessTabs from "@/components/home/ProcessTabs";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero
        size="home"
        bgImage="/images/globalhome.png"
        titleTop="Connecting You to the"
        titleMain="Right Solutions"
        subtitle="We link you with trusted experts in investment, financial, trade, and consulting services to help your business grow."
        ctaLabel="Get Started"
        ctaHref="/talk-to-us"
      />
      <About />
      <ConnectionBanner />
      <ServicesGrid />
      <WhyChooseUs />
      <ProcessTabs />
      <ContactSection />
    </>
  );
}
