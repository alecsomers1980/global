import SectionHeading from '@/components/SectionHeading';
import Icon from '@/components/Icon';
import { whyChooseUs } from '@/lib/content';

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-20">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why East Lake"
          title="Borehole specialists you can rely on"
          align="center"
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/5 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center mx-auto">
                <Icon name={item.icon} className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mt-4">{item.title}</h3>
              <p className="text-sm text-ink/70 mt-2 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}