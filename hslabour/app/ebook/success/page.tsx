import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Download, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Thank you | H&S Labour",
};

export default async function EbookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          {!orderId ? (
            <>
              <p className="text-slate-600">Order not found.</p>
              <Link
                href="/ebook"
                className="mt-4 inline-block text-sm font-medium text-navy underline underline-offset-4 hover:text-green-dark"
              >
                Back to the e-book
              </Link>
            </>
          ) : (
            (async () => {
              const admin = createAdminClient();
              const { data: order } = await admin
                .from("ebook_orders")
                .select("id, status")
                .eq("id", orderId)
                .single();

              if (order?.status === "paid") {
                const { data: product } = await admin
                  .from("ebook_product")
                  .select("file_path, title")
                  .eq("id", 1)
                  .single();

                let signedUrl: string | null = null;
                if (product?.file_path) {
                  const { data: signed } = await admin.storage
                    .from("ebook")
                    .createSignedUrl(product.file_path, 3600);
                  signedUrl = signed?.signedUrl ?? null;
                }

                return (
                  <>
                    <CheckCircle2 className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-green-dark" />
                    <h1 className="mt-4 text-2xl font-bold text-navy">
                      Payment received
                    </h1>
                    <p className="mt-2 text-slate-600">
                      Thanks for your purchase. Your download link is below
                      (valid for 1 hour).
                    </p>
                    {signedUrl ? (
                      <a
                        href={signedUrl}
                        className="mt-6 inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
                      >
                        <Download className="h-4 w-4" /> Download e-book
                      </a>
                    ) : (
                      <p className="mt-6 text-amber-600">
                        Your download is being prepared — we&apos;ll email it
                        shortly.
                      </p>
                    )}
                  </>
                );
              }

              return (
                <>
                  <Clock className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700" />
                  <h1 className="mt-4 text-2xl font-bold text-navy">
                    Processing your payment
                  </h1>
                  <p className="mt-2 text-slate-600">
                    This can take a moment. Refresh this page shortly, or check
                    your email for the download.
                  </p>
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}