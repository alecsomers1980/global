import { values } from '@/lib/content';
import * as LucideIcons from 'lucide-react';
import { Sparkles, type LucideIcon } from 'lucide-react';

export default function Values() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy text-center mb-12">
        What We Value
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
        {values.map((value, idx) => {
          const IconComponent =
            (LucideIcons as unknown as Record<string, LucideIcon>)[value.icon] ?? Sparkles;
          return (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-brand-sand/10 flex items-center justify-center mb-4">
                <IconComponent className="text-brand-sand w-7 h-7" />
              </div>
              <p className="text-brand-navy font-medium">{value.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
