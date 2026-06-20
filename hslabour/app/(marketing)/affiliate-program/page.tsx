import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import PageHeader from "@/components/site/PageHeader";

export const metadata: Metadata = {
  title: "Affiliate Program | H&S Labour Brokers",
  description:
    "Promote H&S Labour's job-hunting e-book and earn commission on every sale. Apply to join our affiliate program.",
};

const steps = [
  {
    title: "Apply",
    body: "Sign up in a minute. We review every application and approve genuine promoters.",
  },
  {
    title: "Share your link",
    body: "Get a unique referral link to share on social media, blogs, or with your network.",
  },
  {
    title: "Earn commission",
    body: "When someone buys through your link, you earn a commission — tracked automatically.",
  },
];

export default function AffiliateProgramPage() {
  return (
    <>
      <PageHeader
        eyebrow="Earn with us"
        title="Affiliate Program"
        intro="Promote our job-hunting e-book and earn commission on every sale. Open to anyone — no cost to join."
        imageSrc="/images/careers-people.jpg"
        imageAlt="Earn commission as an H&S Labour affiliate"
      >
        <Link
          href="/signup"
          className="inline-flex rounded-lg bg-green px-6 py-3 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
        >
          Apply to join
        </Link>
        <Link
          href="/login"
          className="inline-flex rounded-lg border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-mint"
        >
          Affiliate login
        </Link>
      </PageHeader>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-navy">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-lg font-bold text-green-dark">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-navy p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-bold">Ready to start earning?</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/80">
              Join free, get your link, and earn commission promoting a product
              that genuinely helps job seekers.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex rounded-lg bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
            >
              Apply to join
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
