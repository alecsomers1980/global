import Hero from "@/components/home/Hero";
import ValueStrip from "@/components/home/ValueStrip";
import Programs from "@/components/home/Programs";
import Approach from "@/components/home/Approach";
import EnvironmentWellbeing from "@/components/home/EnvironmentWellbeing";
import Values from "@/components/home/Values";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <main>
      <Hero />
      <ValueStrip />
      <Programs />
      <Approach />
      <EnvironmentWellbeing />
      <Values />
      <Testimonials />
      <CtaBanner />
    </main>
  );
}
