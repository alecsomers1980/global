'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="bg-gray-900 text-white font-semibold rounded-xl px-6 py-3 hover:bg-gray-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
