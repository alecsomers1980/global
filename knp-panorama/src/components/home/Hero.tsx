import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center pb-24 pt-16">
      <Image
        src="/images/heroes/home.webp"
        alt="Kruger bushveld at sunset with acacia trees silhouetted against orange sky"
        fill
        priority
        className="object-cover -z-10"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-ink/45" />
      <div className="container-kpe text-center">
        <span className="eyebrow text-white/90">EXPLORE</span>
        <h1 className="mt-4 text-5xl md:text-7xl tracking-wide3 text-white">
          The Wild Lowveld
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-white/85 normal-case">
          Journey into the heart of the Kruger National Park and the Panorama Route with guides
          born in the surrounding villages — people who call this land home.
        </p>
        <Button href="/safari" size="lg" className="mt-8">
          Discover Experiences
        </Button>
      </div>
    </section>
  );
}
