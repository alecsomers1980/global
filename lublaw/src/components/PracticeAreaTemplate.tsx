import type { PracticeArea } from "@/lib/practice-areas";

export default function PracticeAreaTemplate({ area }: { area: PracticeArea }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-maroon mb-6">{area.title}</h1>
      <p className="text-lg text-ink mb-8">{area.intro}</p>
      {area.sections.map((section, i) => (
        <div key={i} className="mb-6">
          {section.heading && (
            <h2 className="font-heading text-xl text-ink mb-2">{section.heading}</h2>
          )}
          <p className="text-muted leading-relaxed">{section.body}</p>
        </div>
      ))}
      <div className="mt-12 p-6 bg-surface rounded-2xl border border-line">
        <p className="text-ink font-medium mb-2">Need advice on this?</p>
        <a href="/contact" className="inline-block rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90">
          Contact us
        </a>
      </div>
    </div>
  );
}
