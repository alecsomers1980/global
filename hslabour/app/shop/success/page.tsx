import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Download, Clock, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Thank you | H&S Labour" };

export default async function ShopSuccessPage({
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
                href="/shop"
                className="mt-4 inline-block font-semibold text-green-dark hover:text-green"
              >
                Back to the shop
              </Link>
            </>
          ) : (
            <OrderBlock orderId={orderId} />
          )}
        </div>
      </div>
    </div>
  );
}

async function OrderBlock({ orderId }: { orderId: string }) {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("shop_orders")
    .select("id, status, product_id")
    .eq("id", orderId)
    .single();

  if (!order) {
    return (
      <>
        <p className="text-slate-600">Order not found.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block font-semibold text-green-dark hover:text-green"
        >
          Back to the shop
        </Link>
      </>
    );
  }

  if (order.status === "paid") {
    const { data: product } = await admin
      .from("shop_products")
      .select("kind, file_path, name")
      .eq("id", order.product_id)
      .single();

    return (
      <>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-green-dark">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-navy">Payment received</h1>

        {product?.kind === "service" ? (
          <ServiceNext orderId={order.id} name={product?.name ?? "order"} />
        ) : (
          <InstantDownload product={product} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Clock className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-navy">Processing your payment</h1>
      <p className="mt-2 text-slate-600">
        This can take a moment — refresh shortly or check your email.
      </p>
    </>
  );
}

async function ServiceNext({ orderId, name }: { orderId: string; name: string }) {
  const admin = createAdminClient();
  const { data: job } = await admin
    .from("service_jobs")
    .select("token")
    .eq("order_id", orderId)
    .maybeSingle();

  return (
    <>
      <p className="mt-2 text-slate-600">
        Thanks for your order. Track progress, upload your CV, and download your finished {name}{" "}
        here:
      </p>
      {job?.token ? (
        <Link
          href={`/orders/${job.token}`}
          className="mt-6 inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
        >
          Open your order
        </Link>
      ) : (
        <p className="mt-6 text-amber-600">
          We&apos;re setting up your order — we&apos;ll email you a link shortly.
        </p>
      )}
    </>
  );
}

async function InstantDownload({
  product,
}: {
  product: { kind: string; file_path?: string | null; name: string } | null;
}) {
  if (!product?.file_path) {
    return (
      <p className="mt-6 text-amber-600">
        Your download is being prepared — we&apos;ll email it shortly.
      </p>
    );
  }

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("shop")
    .createSignedUrl(product.file_path, 3600);

  return (
    <>
      <p className="mt-2 text-slate-600">
        Your download is ready (link valid for 1 hour).
      </p>
      {signed?.signedUrl ? (
        <a
          href={signed.signedUrl}
          className="mt-6 inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
        >
          <Download className="h-4 w-4" /> Download
        </a>
      ) : (
        <p className="mt-6 text-amber-600">
          Your download is being prepared — we&apos;ll email it shortly.
        </p>
      )}
    </>
  );
}