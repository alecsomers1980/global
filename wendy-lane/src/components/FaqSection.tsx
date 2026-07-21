import { FAQS } from "@/data/faqs";

/**
 * Accordion is native <details>/<summary> — no JS, works before hydration and
 * keyboard-accessible for free. The JSON-LD is generated from the same array
 * that renders, so the rich result always matches the visible answers.
 */
function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export default function FaqSection({
  className = "bg-cream",
}: {
  className?: string;
}) {
  return (
    <section className={`${className} px-6 py-20 md:px-12 lg:px-20`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
            Good to know
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tightest text-ink sm:text-5xl">
            Questions we get asked
          </h2>
        </div>

        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-medium text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                <span className="text-lg">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-all duration-300 group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 max-w-2xl pr-14 leading-relaxed text-ink/65">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
