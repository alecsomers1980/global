import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the Endless Global Point website.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <section className="bg-white pt-32 pb-20 md:pt-40">
      <div className="eg-container max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="section-title mt-4">Privacy Policy</h1>
        <p className="mt-6 leading-relaxed text-muted">
          This Privacy Policy explains how Endless Global Point collects, uses,
          and protects the information you provide through this website. When you
          submit an enquiry, we collect your name, contact details, and the
          information you choose to share so we can respond and connect you with
          suitable service providers. We do not sell your personal information.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          The full Privacy Policy content will be published here. To request
          access to or deletion of your information, contact us at{" "}
          <a
            href="mailto:philipokoh24@gmail.com"
            className="font-semibold text-brand hover:underline"
          >
            philipokoh24@gmail.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
