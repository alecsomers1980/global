import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Icon from '@/components/Icon';

interface ServiceCardProps {
  slug: string;
  number: string;
  title: string;
  short: string;
  icon: string;
}

export default function ServiceCard({ slug, number, title, short, icon }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className="block group h-full rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition p-8"
    >
      <div className="text-xs font-semibold text-ink/40 mb-2">{number}</div>
      <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand grid place-items-center">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mt-5 text-ink group-hover:text-brand transition">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink/70 mt-2">{short}</p>
      <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand">
        Learn more
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}