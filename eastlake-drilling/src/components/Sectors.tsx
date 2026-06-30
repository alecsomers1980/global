import SectionHeading from '@/components/SectionHeading';
import Icon from '@/components/Icon';
import { sectors } from '@/lib/content';

export default function Sectors() {
  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading
          eyebrow="Who We Serve"
          title="Water solutions for every property"
          align="center"
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((s, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-black/5 shadow-sm p-7"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent grid place-items-center shrink-0">
                  <Icon name={s.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              </div>
              <p className="text-sm text-ink/70 mt-3 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}