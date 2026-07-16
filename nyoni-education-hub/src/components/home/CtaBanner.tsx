import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-brand-teal px-8 py-14 text-center shadow-soft md:px-16">
        <h2 className="font-heading text-3xl text-white md:text-4xl">
          Ready to see if Nyoni is the right fit?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-brand-sky/90">
          Come see the classrooms, meet the team, and get a feel for a calmer
          way of learning.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/admissions"
            className="inline-flex items-center justify-center rounded-full bg-brand-sand px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-sand/90"
          >
            Book a Tour
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
