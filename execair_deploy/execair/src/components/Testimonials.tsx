const testimonials = [
  {
    quote:
      "Friendly consultants who delivered on their promises. Keep up the awesome work you guys are doing.",
    name: "Rashid",
  },
  {
    quote:
      "Effective, professional and friendly consultants who know what a client needs and deliver on them!",
    name: "Angie",
  },
  {
    quote:
      "Came highly recommended. Well priced, prompt, knowledgeable, friendly and overall great service. Thank you!",
    name: "Alex",
  },
  {
    quote:
      "Know how to deliver! Customer centered business. I recommend Exec-Air to anyone who wants reliable service.",
    name: "Francois",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-brand-navy py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="section-label mb-4">What Our Clients Say</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Trusted by those who matter most
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-brand-teal/30 hover:bg-white/[0.07]"
            >
              {/* Quote mark */}
              <svg
                className="mb-4 h-8 w-8 text-brand-teal/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="mb-6 text-lg leading-relaxed text-white/70 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <cite className="not-italic font-semibold text-white">{t.name}</cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
