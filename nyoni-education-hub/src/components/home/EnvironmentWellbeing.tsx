import { environment, wellbeing } from '@/lib/content';
import { Leaf, Smile } from 'lucide-react';

export default function EnvironmentWellbeing() {
  return (
    <section className="bg-brand-sky/30 py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Environment Card */}
          <div className="bg-white rounded-3xl p-8 shadow-md flex flex-col">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              <Leaf className="text-brand-teal w-6 h-6" />
            </div>
            {environment.eyebrow && (
              <p className="text-xs uppercase tracking-widest text-brand-teal mb-2">
                {environment.eyebrow}
              </p>
            )}
            <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4">
              {environment.heading}
            </h3>
            <p className="text-brand-navy/70 leading-relaxed">
              {environment.body}
            </p>
          </div>
          {/* Wellbeing Card */}
          <div className="bg-white rounded-3xl p-8 shadow-md flex flex-col">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              <Smile className="text-brand-teal w-6 h-6" />
            </div>
            {wellbeing.eyebrow && (
              <p className="text-xs uppercase tracking-widest text-brand-teal mb-2">
                {wellbeing.eyebrow}
              </p>
            )}
            <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4">
              {wellbeing.heading}
            </h3>
            <p className="text-brand-navy/70 leading-relaxed">
              {wellbeing.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
