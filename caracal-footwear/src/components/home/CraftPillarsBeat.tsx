import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';

const PILLARS = [
  { title: 'Genuine Leather', body: 'Full-grain hide, hand-cut and hand-stitched. No synthetics.' },
  { title: 'Non-Slip TPR Sole', body: 'Built to grip on tar, dirt and everything between.' },
  { title: 'Handmade', body: 'Every pair made to order. Nothing off a factory line.' },
];

export default function CraftPillarsBeat() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/products/classic-chukka-tan.webp" alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-canvas/85" aria-hidden="true" />
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 grid gap-10 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} delay={i * 0.1}>
            <div className="text-center">
              <h3 className="display text-2xl text-text">{pillar.title}</h3>
              <p className="mt-3 text-sm text-muted">{pillar.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}