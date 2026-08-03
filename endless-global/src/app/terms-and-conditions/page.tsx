import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for the Endless Global Point website.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <section className="bg-white pt-32 pb-20 md:pt-40">
      <div className="eg-container max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="section-title mt-4">Terms of Use</h1>
        <p className="mt-6 leading-relaxed text-muted">
          These Terms of Use govern your access to and use of the Endless Global
          Point website. By using this site you agree to these terms. Endless
          Global Point acts as a connector between clients and independent,
          third-party service providers; we are not the service provider and do
          not guarantee the outcome of any engagement you enter into with a
          matched partner.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          The full Terms of Use content will be published here. For any questions
          in the meantime, please contact us at{" "}
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
