"use client";
import DataTable from "@/app/admin/_components/DataTable";

export type ClientRow = {
  id: string;
  name: string;
  slug: string;
  vertical: string | null;
  status: string | null;
  updated_at: string;
};

// Owns the columns so the server page passes only plain rows (functions can't cross the RSC boundary).
export default function ClientsTable({ rows }: { rows: ClientRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "vertical", label: "Vertical", render: (row) => row.vertical ?? "—" },
        {
          key: "status",
          label: "Status",
          render: (row) => <span className="text-xs uppercase tracking-wide text-ember-500">{row.status}</span>,
        },
        { key: "updated_at", label: "Updated", render: (row) => new Date(row.updated_at).toLocaleDateString("en-ZA") },
      ]}
      searchKeys={["name", "slug", "vertical"]}
      initialSort={{ key: "name", dir: "asc" }}
      rowHref={(row) => `/admin/clients/${row.id}`}
    />
  );
}
