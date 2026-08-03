import Link from "next/link";

export default function HomeAbout() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="eg-container">
        {/* Header */}
        <div>
          <span className="eyebrow">About Us</span>
          <h2 className="section-title mt-4 max-w-xl">
            Your Trusted Partner in Every Step
          </h2>
        </div>

        {/* Two‑column body */}
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:gap-16 items-start">
          {/* LEFT – image + overlay card */}
          <div className="relative">
            <img
              src="/images/Rectangle-6.png"
              alt="Endless Global Point team"
              className="w-full rounded-xl object-cover shadow-lg"
            />
            <div
              className="absolute bottom-4 right-4 max-w-xs rounded-xl p-6 shadow-xl text-brand ring-1 ring-black/5"
              style={{
                backgroundColor: "#f3f1e6",
                backgroundImage: "url('/images/drivenResultsBg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h3 className="font-semibold uppercase tracking-wide">
                Driven Results
              </h3>
              <ul className="mt-4 space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-brand flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear Goals
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-brand flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trusted Partners
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-brand flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Measurable Outcomes
                </li>
              </ul>
              <Link href="/about-us" className="btn-primary mt-5 text-xs">
                Learn More →
              </Link>
            </div>
          </div>

          {/* RIGHT – descriptive text */}
          <div>
            <p className="text-lg font-medium text-ink">
              We simplify the process of finding the right professionals by
              connecting you to trusted service providers that match your needs.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              At our core, we are not the service provider, we are the
              connector. We exist to simplify the way businesses and
              individuals access high-value services in investment, finance,
              trade, and consulting. Instead of navigating endless options, we
              match you with the right professionals who have the expertise,
              track record, and credibility to meet your needs.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              Our role is to remove the uncertainty, save you time, and give
              you peace of mind. By leaning on our trusted network, you can
              focus on your goals while we make sure you{"'"}re introduced to
              the partners who will help you achieve them.
            </p>
          </div>
        </div>

        {/* Three‑column feature row */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* 1 – Independent Guidance */}
          <div>
            <span className="w-10 h-1 bg-brand rounded mb-3 block" />
            <h3 className="text-xl font-semibold text-brand">
              Independent Guidance
            </h3>
            <p className="text-muted leading-relaxed mt-2">
              We don{"'"}t push one provider over another. Our recommendations
              are based purely on what{"'"}s best for you — ensuring
              transparency and trust at every step.
            </p>
          </div>

          {/* 2 – Trusted Network */}
          <div>
            <span className="w-10 h-1 bg-brand rounded mb-3 block" />
            <h3 className="text-xl font-semibold text-brand">
              Trusted Network
            </h3>
            <p className="text-muted leading-relaxed mt-2">
              Our partnerships are carefully built with businesses and
              professionals who have proven reputations. When we connect you,
              you can be confident you{"'"}re in good hands.
            </p>
          </div>

          {/* 3 – Tailored Solutions */}
          <div>
            <span className="w-10 h-1 bg-brand rounded mb-3 block" />
            <h3 className="text-xl font-semibold text-brand">
              Tailored Solutions
            </h3>
            <p className="text-muted leading-relaxed mt-2">
              No two clients are the same. We take the time to understand your
              goals and then introduce you to providers who can deliver custom
              solutions that fit your journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
