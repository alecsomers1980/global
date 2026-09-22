"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type SortDir = "asc" | "desc";

export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  initialSort,
  rowHref,
}: {
  rows: T[];
  columns: { key: keyof T & string; label: string; render?: (row: T) => ReactNode }[];
  searchKeys: (keyof T & string)[];
  initialSort?: { key: keyof T & string; dir: SortDir };
  rowHref?: (row: T) => string;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: keyof T & string; dir: SortDir }>(() =>
    initialSort ?? {
      key: columns.length > 0 ? columns[0].key : ("" as keyof T & string),
      dir: "asc",
    }
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        return String(value ?? "").toLowerCase().includes(term);
      })
    );
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = String(a[sort.key] ?? "");
      const bVal = String(b[sort.key] ?? "");
      const cmp = aVal.localeCompare(bVal);
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  function toggleSort(key: keyof T & string) {
    setSort((current) => {
      if (current.key === key) {
        return { key, dir: current.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search..."
        className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
      />

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6b6b8a]">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => toggleSort(column.key)}
                className="py-2 cursor-pointer select-none"
              >
                <span className="inline-flex items-center gap-1">
                  {column.label}
                  {sort.key === column.key ? (
                    <span>{sort.dir === "asc" ? "▲" : "▼"}</span>
                  ) : null}
                </span>
              </th>
            ))}
            {rowHref ? <th className="py-2"></th> : null}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const href = rowHref ? rowHref(row) : null;

            return (
              <tr key={row.id} className="border-t border-[#2a2a3d]">
                {columns.map((column) => (
                  <td key={column.key} className="py-2">
                    {column.render ? column.render(row) : String(row[column.key] ?? "")}
                  </td>
                ))}
                {rowHref ? (
                  <td className="py-2 text-right">
                    <a className="text-ember-500" href={href ?? "#"}>Open →</a>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 ? (
        <p className="text-[#6b6b8a] text-sm">No matches.</p>
      ) : null}
    </div>
  );
}
