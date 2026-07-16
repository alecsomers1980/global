import { mission, philosophyPoints } from '@/lib/content';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Approach() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image placeholder */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-teal/20 to-brand-sky h-80 md:h-96 flex items-center justify-center shadow-xl">
          <BookOpen className="text-brand-teal w-24 h-24 opacity-70" />
        </div>
        {/* Content */}
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy mb-6">
            Learning That Understands, Not Just Repeats
          </h2>
          <p className="text-brand-navy/80 mb-8 leading-relaxed">
            {mission}
          </p>
          <ul className="space-y-4">
            {philosophyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Sparkles className="text-brand-teal mt-1 w-5 h-5 flex-shrink-0" />
                <span className="text-brand-navy/70">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
