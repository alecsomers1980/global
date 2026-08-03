import { whyChoose } from "@/lib/content";

export default function WhyChooseUs() {
  return (
    <>
      <div className="relative h-56 md:h-72 w-full">
        <img
          src="/images/Rectangle-18.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <section className="py-16 md:py-24 bg-white">
        <div className="eg-container">
          <span className="eyebrow">Why Choose Us</span>
          <h2 className="section-title mt-4 max-w-xl">The Value of Working With Us</h2>
          <p className="mt-4 text-muted max-w-2xl">
            We&apos;re not just advisors, we&apos;re connectors, ensuring you get the right expertise without the guesswork.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {whyChoose.map((item, index) => (
              <div key={index}>
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-16 w-16 object-contain"
                />
                <h3 className="mt-4 text-lg font-semibold text-brand">{item.title}</h3>
                <p className="mt-2 text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
