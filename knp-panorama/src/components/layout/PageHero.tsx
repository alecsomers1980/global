import Image from 'next/image';

type Props = {
  title: string;
  intro?: string;
  image: string;
  imageAlt: string;
  eyebrow?: string;
};

export const PageHero = ({ title, intro, image, imageAlt, eyebrow }: Props) => {
  return (
    <section className="relative flex h-[45vh] min-h-[320px] items-center justify-center">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        className="object-cover -z-10"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-ink/50" />
      {/* Constrained to the viewport: a long uppercase title with wide tracking
          ("ACCOMMODATION") is wider than a 375px screen at the desktop size,
          so the type scales down and the container cannot exceed the viewport. */}
      <div className="w-full max-w-full px-5 text-center">
        {eyebrow && (
          <span className="eyebrow text-white/85">{eyebrow}</span>
        )}
        <h1 className="mt-3 break-words text-2xl tracking-wide2 text-white sm:text-4xl sm:tracking-wide3 md:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85 normal-case">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
};
