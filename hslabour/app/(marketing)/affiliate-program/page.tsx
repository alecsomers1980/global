import type { Metadata } from "next";
import Link from "next/link";
import { Share2, Wallet, HeartHandshake } from "lucide-react";
import Container from "@/components/site/Container";
import PageHeader from "@/components/site/PageHeader";
import ParallaxSection from "@/components/site/ParallaxSection";

export const metadata: Metadata = {
  title: "Affiliate Program | H&S Labour Brokers",
  description:
    "Make a referral and earn extra cash. Share our job-hunting e-book, earn commission on every sale, and help South Africans find work. Free to join.",
  alternates: { canonical: "/affiliate-program" },
};

const earnings = [
  {
    icon: Share2,
    title: "Empower others",
    body: "Share proven job-hunting strategies that genuinely help people land work.",
  },
  {
    icon: Wallet,
    title: "Earn handsome commissions",
    body: "For every e-book sold through your link, you pocket a share of the profits.",
  },
  {
    icon: HeartHandshake,
    title: "Promote flexibly",
    body: "Share through your blog, social media, or simple word-of-mouth — whatever suits you.",
  },
];

const steps = [
  {
    title: "Apply",
    body: "Sign up in under a minute. We review every application and approve genuine promoters.",
  },
  {
    title: "Share your link",
    body: "Get a unique referral link to share on social media, your blog, or with your network.",
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
        title="Make a referral and earn some extra cash"
        intro="Share our job-hunting e-book and earn commission on every sale. You can be ANYONE — content creator, influencer, nurse, teacher, stay-at-home parent, or just someone looking to make extra cash. Free to join."
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

      {/* How you earn */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              How you earn
            </h2>
            <p className="mt-3 text-slate-600">
              Earn commission by partnering with us. There&apos;s no cost to
              join and no limit on what you can make.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {earnings.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Market opportunity */}
      <section className="bg-mint py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              A huge market to tap into
            </h2>
            <p className="mt-3 text-slate-600">
              The demand for practical job-hunting help in South Africa is
              enormous — which means plenty of people to share with.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-8">
              <p className="text-4xl font-bold text-green-dark">16.7M</p>
              <p className="mt-2 text-sm text-slate-600">
                employed South Africans who could level up their careers.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8">
              <p className="text-4xl font-bold text-green-dark">7.8M</p>
              <p className="mt-2 text-sm text-slate-600">
                people actively searching for work right now.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <ParallaxSection
        image="/images/parallax/office-collab.jpg"
        eyebrow="No cost to join"
        title="Turn your network into an income stream"
        subtitle="Share a product that genuinely helps job seekers, and earn commission on every sale through your unique referral link."
        cta={{ href: "/signup", label: "Apply to join" }}
      />

      {/* How it works */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-lg font-bold text-green-dark">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-navy p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-bold">Ready to start earning?</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/80">
              Unlock an extra income stream, empower others in their job search,
              and become part of a supportive community. Join free, get your
              link, and start earning.
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
