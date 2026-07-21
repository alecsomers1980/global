import type { ReactNode } from "react";

/**
 * The one page-header treatment for every secondary page. Previously each page
 * rolled its own (flat brand/timber block, half centred and half left-aligned);
 * this keeps them consistent and gives them some depth.
 */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink py-20 lg:py-28">
      {/* Depth: diagonal wash, a soft brand glow, and a hairline top rule */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-brand-900" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-leaf/40 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-leaf">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tightest text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
