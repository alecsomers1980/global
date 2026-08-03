import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageBanner
        eyebrow="LEGAL"
        title="Privacy Policy"
        image="/images/vehiclesBanner.jpg"
      />
      <section className="bg-cream py-20 md:py-24">
        <div className="el-container max-w-3xl">
          <div className="space-y-6 text-muted text-sm leading-relaxed">
            <p>
              Endless Luxury respects your privacy. This policy explains how we collect, use, and
              protect the personal information you provide when making an enquiry or using our
              services, in line with the Protection of Personal Information Act (POPIA).
            </p>
            <h2 className="font-heading text-navy text-lg font-semibold pt-4">Information We Collect</h2>
            <p>
              We collect the details you submit through our enquiry forms — such as your name,
              contact number, email address, and the details of your requested service — solely to
              arrange and fulfil your booking.
            </p>
            <h2 className="font-heading text-navy text-lg font-semibold pt-4">How We Use It</h2>
            <p>
              Your information is used to respond to enquiries, coordinate with trusted providers,
              and keep you informed about your booking. We do not sell your personal information.
            </p>
            <p className="italic">
              This page is a placeholder. Please supply your final Privacy Policy copy for
              publication.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
