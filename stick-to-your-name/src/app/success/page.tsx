import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams?.orderId;
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-lg p-8">
        <CheckCircle className="w-16 h-16 mx-auto text-brand-green" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Thank you — payment received!
        </h1>
        <p className="mt-3 text-gray-600">
          We&apos;ve received your order
          {orderId ? (
            <>
              {" "}— ref{" "}
              <span className="font-mono text-sm text-gray-800">
                {orderId.slice(0, 8)}
              </span>
            </>
          ) : null}
          . You&apos;ll get an email confirmation shortly. We dispatch within
          1–2 weeks.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Questions? WhatsApp <span className="font-medium">083 417 5490</span>{" "}
          or email{" "}
          <a
            className="text-brand-pink underline"
            href="mailto:melissa@aloesigns.co.za"
          >
            melissa@aloesigns.co.za
          </a>
          .
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand-pink px-5 py-3 text-white font-semibold hover:bg-brand-pink/90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
