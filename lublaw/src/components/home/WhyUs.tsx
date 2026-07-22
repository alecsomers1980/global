const REASONS = [
  { title: "Experience", body: "We have more than 20 years' in practice across a wide range of specialities." },
  { title: "Knowledge", body: "Our attorneys are experts in their field and offer legal advice with your interests in mind." },
  { title: "Passion", body: "We are passionate about offering our clients a tailored service, unique to their individual circumstances and needs." },
];

export default function WhyUs() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="font-heading text-3xl text-center text-ink mb-10">Why use us?</h2>
      <div className="grid sm:grid-cols-3 gap-8">
        {REASONS.map((r) => (
          <div key={r.title} className="text-center">
            <h3 className="font-heading text-xl text-maroon mb-2">{r.title}</h3>
            <p className="text-muted">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
