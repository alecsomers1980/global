import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-[1300px] mx-auto px-6 py-32 text-center flex flex-col gap-5">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-[var(--color-muted)]">
        That story may have moved, or the link may be wrong.
      </p>
      <Link href="/" className="font-bold text-[var(--brand-accent)] hover:underline">
        Back to the homepage
      </Link>
    </main>
  );
}