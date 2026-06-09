import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelledPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-lg p-8">
        <XCircle className="w-16 h-16 mx-auto text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Payment cancelled
        </h1>
        <p className="mt-3 text-gray-600">
          No worries — your order was not placed. You can try again any time.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand-pink px-5 py-3 text-white font-semibold hover:bg-brand-pink/90"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
