import Container from "@/components/site/Container";
import Image from "next/image";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  intro,
  imageSrc,
  imageAlt,
  children,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-mint">
      {/* decorative accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 right-12 h-40 w-40 rounded-full border-2 border-green/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-24 h-24 w-24 rounded-full border border-green/20"
      />
      <Container className="relative z-10 py-16 sm:py-20 lg:py-24">
        {imageSrc ? (
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl text-balance">
                {title}
              </h1>
              {intro && (
                <p className="mt-5 max-w-xl text-lg text-slate-600 text-pretty">
                  {intro}
                </p>
              )}
              {children && (
                <div className="mt-8 flex flex-wrap gap-4">{children}</div>
              )}
            </div>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl shadow-xl ring-1 ring-navy/10">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl text-balance">
              {title}
            </h1>
            {intro && (
              <p className="mt-5 max-w-xl text-lg text-slate-600 text-pretty">
                {intro}
              </p>
            )}
            {children && (
              <div className="mt-8 flex flex-wrap gap-4">{children}</div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}