import { getSiteSettings } from "@/lib/queries/products";
import ContactForm from "@/components/contact/ContactForm";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">Get In Touch</h1>
      <p className="mt-3 text-muted">
        Questions about sizing, an order, or a custom request — WhatsApp is fastest.
      </p>
      <a
        href={`https://wa.me/${settings.whatsapp_number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
      >
        WhatsApp Us
      </a>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}