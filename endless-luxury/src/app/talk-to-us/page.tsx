import type { Metadata } from "next";
import Image from "next/image";
import PageBanner from "@/components/ui/PageBanner";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Talk To Us",
};

export default function TalkToUsPage() {
  return (
    <>
      <PageBanner
        eyebrow="MAKE AN ENQUIRY"
        title="Talk To Us"
        image="/images/selective-focus-view-of-different-mercedes-benz-ca-2025-02-09-05-09-52-utc-scaled.jpg"
      />
      <section className="bg-cream py-20 md:py-24">
        <div className="el-container">
          <div className="text-center">
            <span className="el-eyebrow">TALK TO OUR TEAM</span>
            <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl mt-3">
              Arrange your next vehicle with ease
            </h2>
            <p className="text-muted mt-5 max-w-3xl mx-auto">
              Every journey begins with a conversation. Whether you&apos;re arranging a vehicle for a special
              occasion, a professional transfer, or a bespoke experience, our team is here to assist with
              precision and care. Share your requirements below, and we&apos;ll handle the rest, seamlessly,
              discreetly, and on your schedule.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start mt-12">
            <div className="relative rounded-[12px] overflow-hidden h-[520px]">
              <Image
                src="/images/contact-page-1.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
