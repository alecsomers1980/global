import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <>
      <PageBanner
        eyebrow="LEGAL"
        title="Terms of Use"
        image="/images/servicesBanner.jpg"
      />
      <section className="bg-cream py-20 md:py-24">
        <div className="el-container max-w-3xl">
          <div className="space-y-6 text-muted text-sm leading-relaxed">
            <p>
              Welcome to Endless Luxury. By accessing or using this website you agree to be
              bound by these Terms of Use. Endless Luxury acts as a connector between clients
              and trusted third-party providers of vehicles, chauffeurs, and related
              experiences. All bookings are subject to availability and confirmation.
            </p>
            <h2 className="font-heading text-navy text-lg font-semibold pt-4">Bookings &amp; Quotes</h2>
            <p>
              Prices depend on the vehicle, service type, and duration. A tailored quote is
              provided upfront and remains valid for the period stated at the time of enquiry.
              Confirmation of a booking constitutes acceptance of the applicable rate and
              conditions of the relevant provider.
            </p>
            <h2 className="font-heading text-navy text-lg font-semibold pt-4">Liability</h2>
            <p>
              While every arrangement is handled with care and precision, Endless Luxury is not
              liable for the acts or omissions of third-party providers. Full terms will be
              confirmed in your booking agreement.
            </p>
            <p className="italic">
              This page is a placeholder. Please supply your final Terms of Use copy for
              publication.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
