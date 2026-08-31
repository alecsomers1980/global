import { Reveal } from "@/components/motion/Reveal";

const BEATS = [
  {
    title: "One plant per bottle",
    body: "No blends and no bulking agents. What the label names is what is inside.",
    icon: (
      <>
        <path d="M12 21c0-6 3-10 8-12-1 7-4 10-8 12z" />
        <path d="M12 21c0-5-2-8-7-9 1 5 3 8 7 9z" />
        <path d="M12 21v-4" />
      </>
    ),
  },
  {
    title: "Traditionally used",
    body: "Each page sets out how the plant has long been used in South Africa — heritage, not health claims.",
    icon: (
      <>
        <path d="M5 9h14l-1.2 11H6.2L5 9z" />
        <path d="M9 9V6.5A3 3 0 0 1 15 6.5V9" />
        <path d="M9.5 13.5h5" />
      </>
    ),
  },
  {
    title: "Farming that gives back",
    body: "Every purchase backs sustainable farming and rural training through Foundations for Farming.",
    icon: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20v-6l5-4 5 4v6" />
        <path d="M10 20v-4h4v4" />
      </>
    ),
  },
];

/**
 * The three beats sit on a full-width teal wash rather than the page ground.
 * It is the one band between the product grid and the stockist call to action,
 * and giving it the brand colour is what stops the middle of the homepage
 * reading as a stretch of white.
 */
export function ProofBeats() {
  return (
    <section className="mt-24 bg-brand-wash py-20 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-16">
        <div className="grid gap-12 md:grid-cols-3 md:gap-14">
          {BEATS.map((beat, i) => (
            <Reveal key={beat.title} delay={i * 0.08}>
              <div className="flex flex-col gap-4">
                <span className="flex h-14 w-14 items-center justify-center bg-brand text-brand-ink">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    {beat.icon}
                  </svg>
                </span>
                <h3 className="font-display text-2xl text-ink">{beat.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">{beat.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
