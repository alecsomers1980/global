import Link from 'next/link';
import { company, serviceAreas } from '@/lib/content';

export default function ServiceAreas() {
  return (
    <section className="bg-brand-darker text-white py-20">
      <div className="container-px">
        <p className="eyebrow text-white/80 text-center">Areas We Serve</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 text-center">
          Borehole drilling across Johannesburg & Gauteng
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto mt-3 text-center">
          We cover {company.serviceArea} and surrounding areas. If your suburb isn’t listed, please get in touch.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {serviceAreas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm"
            >
              {area}
            </span>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/contact"
            className="inline-block bg-white text-brand-darker rounded-full px-6 py-3 font-semibold"
          >
            Check availability in your area
          </Link>
        </div>
      </div>
    </section>
  );
}