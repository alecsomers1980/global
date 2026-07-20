import { notFound } from "next/navigation";
import Link from "next/link";
import { getDealer } from "@/lib/dealers";
import DealerForm from "@/components/admin/DealerForm";

type Params = { id: string };

export default async function EditDealerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const dealer = await getDealer(id);
  if (!dealer) notFound();

  return (
    <div>
      <Link
        href="/admin/dealers"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Back to dealers
      </Link>
      <h1 className="text-2xl font-semibold text-ink mt-2 mb-6">{dealer.name}</h1>
      <DealerForm dealer={dealer} />
    </div>
  );
}
