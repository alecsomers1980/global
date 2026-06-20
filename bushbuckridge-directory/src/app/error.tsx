'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected issue. Please try again or go back to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 font-semibold rounded-xl px-6 py-3 hover:bg-gray-300 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
