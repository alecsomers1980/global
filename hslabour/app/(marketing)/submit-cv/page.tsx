import type { Metadata } from "next";
import Container from "@/components/site/Container";
import PageHeader from "@/components/site/PageHeader";
import PlacementPartnerEmbed from "@/components/jobs/PlacementPartnerEmbed";

// Stable PlacementPartner application form; overridable via env if it ever changes.
const APPLICATION_URL =
  process.env.NEXT_PUBLIC_PP_APPLICATION_URL ??
  "https://webapp.placementpartner.com/wi/application_form.php?id=hslabour";

export const metadata: Metadata = {
  title: "Submit Your CV",
  description:
    "Send us your CV and join our talent pool. H&S Labour Brokers places permanent, contract and temporary staff across South Africa.",
  alternates: { canonical: "/submit-cv" },
};

export default function SubmitCvPage() {
  return (
    <>
      <PageHeader
        eyebrow="Job Seekers"
        title="Submit your CV"
        intro="Join our talent pool. Complete the form below and our recruitment team will be in touch when a role matches your skills and experience."
        imageSrc="/images/careers-people.jpg"
        imageAlt="Submit your CV to H&S Labour Brokers"
      />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <PlacementPartnerEmbed url={APPLICATION_URL} title="CV application form" />
          <noscript>
            <p className="mt-4 text-sm text-slate-500">
              Your browser doesn&apos;t support the embedded form.{" "}
              <a
                href={APPLICATION_URL}
                className="text-green-dark underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the application form
              </a>
              .
            </p>
          </noscript>
        </Container>
      </section>
    </>
  );
}
