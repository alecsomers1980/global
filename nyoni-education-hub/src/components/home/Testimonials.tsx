import { testimonials } from '@/lib/content';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy text-center mb-12">
        What Parents Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-brand-navy text-white rounded-3xl p-8 flex flex-col">
            <Quote className="text-brand-sand w-8 h-8 mb-4" />
            <p className="italic text-white/90 leading-relaxed flex-1 mb-4">
              {t.quote}
            </p>
            <p className="text-sm text-white/70">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}