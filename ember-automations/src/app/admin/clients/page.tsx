import type { ReactNode } from "react";
import { serviceClient } from "@/lib/supabaseServer";
import DataTable from "../_components/DataTable";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  vertical: string | null;
  status: string | null;
  updated_at: string;
};

export default async function AdminClientsPage() {
  const db = serviceClient();
  const { data } = await db.from("clients").select("*").order("name", { ascending: true });

  const rows: ClientRow[] = (data ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    slug: client.slug,
    vertical: client.vertical,
    status: client.status,
    updated_at: client.updated_at,
  }));

  const columns: { key: keyof ClientRow & string; label: string; render?: (row: ClientRow) => ReactNode }[] = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "vertical", label: "Vertical" },
    { key: "status", label: "Status" },
    {
      key: "updated_at",
      label: "Updated",
      render: (row: ClientRow) => new Date(row.updated_at).toLocaleDateString("en-ZA"),
    },
  ];

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Clients</h1>
        <a
          href="/admin/clients/new"
          className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + New client
        </a>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={["name", "slug", "vertical"]}
        initialSort={{ key: "name", dir: "asc" }}
        rowHref={(row) => `/admin/clients/${row.id}`}
      />
    </div>
  );
}
