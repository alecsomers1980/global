"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/app/admin/_components/DataTable";
import type { CatalogueItem, Size } from "@/lib/spine/types";

export default function CatalogueTable({ items }: { items: CatalogueItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState<Size>("S");
  const [verticals, setVerticals] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [msg, setMsg] = useState("");

  const toggleActive = async (row: CatalogueItem) => {
    const res = await fetch(`/api/admin/spine/catalogue/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "failed");
      return;
    }

    router.refresh();
  };

  const addItem = async (event: FormEvent) => {
    event.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/spine/catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        size,
        verticals: verticals.split(",").map((v) => v.trim()).filter(Boolean),
        sort_order: Number(sortOrder) || 0,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "failed");
      return;
    }

    setName("");
    setDescription("");
    setSize("S");
    setVerticals("");
    setSortOrder("0");
    router.refresh();
  };

  const columns: { key: keyof CatalogueItem & string; label: string; render?: (row: CatalogueItem) => ReactNode }[] = [
    { key: "name", label: "Name" },
    { key: "size", label: "Size" },
    { key: "verticals", label: "Verticals", render: (row) => (row.verticals ?? []).join(", ") },
    {
      key: "active",
      label: "Active",
      render: (row) => (
        <button className="text-ember-500 text-xs uppercase tracking-wide" onClick={() => toggleActive(row)}>
          {row.active ? "yes" : "no"}
        </button>
      ),
    },
    { key: "sort_order", label: "Sort order" },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        rows={items}
        columns={columns}
        searchKeys={["name", "description"] as (keyof CatalogueItem & string)[]}
        initialSort={{ key: "sort_order" as keyof CatalogueItem & string, dir: "asc" }}
      />

      <div className="rounded-lg border border-[#2a2a3d] p-4">
        <h2 className="text-sm font-semibold mb-3">Add catalogue item</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={addItem}>
          <div>
            <label className="text-xs uppercase tracking-wide text-ember-500 block mb-1">Name</label>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-ember-500 block mb-1">Size</label>
            <select
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
              value={size}
              onChange={(e) => setSize(e.target.value as Size)}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-ember-500 block mb-1">Description</label>
            <textarea
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-ember-500 block mb-1">Verticals (comma-separated)</label>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
              value={verticals}
              onChange={(e) => setVerticals(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-ember-500 block mb-1">Sort order</label>
            <input
              type="number"
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm" type="submit">
              Add item
            </button>
            {msg ? <span className="text-sm text-[#6b6b8a]">{msg}</span> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

