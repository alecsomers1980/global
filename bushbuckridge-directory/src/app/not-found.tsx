import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-primary text-white font-semibold rounded-xl px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/find-a-service"
            className="bg-gray-200 text-gray-800 font-semibold rounded-xl px-6 py-3 hover:bg-gray-300 transition-colors"
          >
            Browse the directory
          </Link>
        </div>
      </div>
    </div>
  );
}
