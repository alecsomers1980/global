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
      <div className="text-center px-4">
        {eyebrow && (
          <span className="eyebrow text-white/85">{eyebrow}</span>
        )}
        <h1 className="mt-3 text-4xl md:text-5xl tracking-wide3 text-white">
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
