import Container from "@/components/site/Container";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Smart, adaptable, and cost-effective. H&S Labour's tailored packages, covering everything from response handling to psychometrics, prove they understand and deliver to unique business needs. A decade of partnership speaks volumes.",
    name: "Andrew",
    role: "Director",
  },
  {
    quote:
      "H&S Labour has been a vital partner since 2005. Their tailored solutions, from recruitment to HR services, showcase a deep understanding of our needs. A strategic choice for business growth!",
    name: "Jolie",
    role: "HR Manager",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
            What our clients say
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <Quote className="h-8 w-8 text-green" />
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-slate-700">
                {t.quote}
              </blockquote>
              <footer className="mt-6">
                <div className="font-semibold text-navy">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </footer>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}