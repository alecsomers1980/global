import Link from "next/link";
import DealerForm from "@/components/admin/DealerForm";

export default function NewDealerPage() {
  return (
    <div>
      <Link
        href="/admin/dealers"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Back to dealers
      </Link>
      <h1 className="text-2xl font-semibold text-ink mt-2 mb-6">Add dealer</h1>
      <DealerForm />
    </div>
  );
}
