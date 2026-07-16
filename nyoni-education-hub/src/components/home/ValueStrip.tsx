import { valueStrip } from "@/lib/content";

export default function ValueStrip() {
  return (
    <section className="bg-brand-sky/40 py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4">
        {valueStrip.map((phrase) => (
          <span
            key={phrase}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-navy shadow-sm"
          >
            {phrase}
          </span>
        ))}
      </div>
    </section>
  );
}
