import { serviceClient } from "@/lib/supabaseServer";
import ClientsTable, { type ClientRow } from "./ClientsTable";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const db = serviceClient();
  const { data } = await db.from("clients").select("*").order("name", { ascending: true });

  const rows: ClientRow[] = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    vertical: c.vertical,
    status: c.status,
    updated_at: c.updated_at,
  }));

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Clients</h1>
        <a href="/admin/clients/new" className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm">
          + New client
        </a>
      </div>
      <ClientsTable rows={rows} />
    </div>
  );
}
