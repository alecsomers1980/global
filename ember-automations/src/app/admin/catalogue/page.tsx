import { serviceClient } from "@/lib/supabaseServer";
import type { CatalogueItem } from "@/lib/spine/types";
import CatalogueTable from "./CatalogueTable";

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const db = serviceClient();
  const { data } = await db.from("catalogue_items").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
  const items = (data ?? []) as CatalogueItem[];

  return (
    <div className="glass p-6">
      <h1 className="text-xl font-bold mb-4">Catalogue</h1>
      <CatalogueTable items={items} />
    </div>
  );
}
