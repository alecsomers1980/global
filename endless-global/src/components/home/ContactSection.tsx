import ContactForm from "@/components/ContactForm";

export default function ContactSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Rectangle-24.png')" }}
      />
      {/* Dark green overlay */}
      <div className="absolute inset-0 bg-brand/85" />
      {/* Content */}
      <div className="relative z-10 eg-container py-16 md:py-24 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left column */}
        <div className="text-white">
          <span className="eyebrow bg-white/15 text-white">Get In Touch</span>
          <h2 className="section-title mt-4 !text-white">
            Ready to find the right partner?
          </h2>
          <p className="mt-4 text-white/85 max-w-md">
            Let&apos;s connect you with the expertise you need today.
          </p>
        </div>
        {/* Right column */}
        <div>
          <ContactForm variant="full" />
        </div>
      </div>
    </section>
  );
}
