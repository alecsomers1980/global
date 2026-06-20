import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-mint px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Sorry, we couldn&apos;t find the page you were looking for.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
      >
        Back to home
      </Link>
    </main>
  );
}
