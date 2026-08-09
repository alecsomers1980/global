import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="text-4xl md:text-5xl tracking-wide3">Page Not Found</h1>
      <p className="mt-4 max-w-md text-sm text-text/70 normal-case">
        This page has moved or no longer exists. You can start from the
        homepage or request a quote and we&apos;ll help you from there.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded bg-amber px-8 py-4 text-sm font-semibold uppercase tracking-wide2 text-ink hover:bg-amber-soft"
        >
          Back to Home
        </Link>
        <Link
          href="/request-a-quote"
          className="inline-flex items-center justify-center gap-2 rounded border border-amber px-8 py-4 text-sm font-semibold uppercase tracking-wide2 text-amber-text hover:bg-amber hover:text-ink"
        >
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
