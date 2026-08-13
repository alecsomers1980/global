import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Woodpecker Guesthouse for accommodation, restaurant and conferencing enquiries in Hazyview, Mpumalanga.",
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Contact Us</h1>
      <p className="text-muted mb-10">Send us an enquiry and we'll get back to you as soon as we can.</p>
      <ContactForm />
    </main>
  );
}