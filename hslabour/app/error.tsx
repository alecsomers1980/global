"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-mint px-4 text-center">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        An unexpected error occurred. Please try again, or contact us if the
        problem persists.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex rounded-lg bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
      >
        Try again
      </button>
    </main>
  );
}
