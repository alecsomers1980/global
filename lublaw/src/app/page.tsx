import Hero from "@/components/home/Hero";
import WhyUs from "@/components/home/WhyUs";
import SpecialismsGrid from "@/components/home/SpecialismsGrid";
import AboutBerna from "@/components/home/AboutBerna";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading text-3xl text-ink mb-6">Where people matter</h2>
        <p className="text-muted leading-relaxed">
          At B Lubbe &amp; Associates, we understand the importance of having someone you can trust
          on your side at every important time in your life. We pride ourselves in offering our
          clients a personalised service that exceeds their expectations and delivers the best
          possible results in all legal matters.
        </p>
      </section>
      <WhyUs />
      <SpecialismsGrid />
      <AboutBerna />
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl text-center text-ink mb-8">Get in touch</h2>
        <ContactForm />
      </section>
    </>
  );
}
