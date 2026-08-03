"use client";

import React from "react";

interface ExportCsvButtonProps {
  rows: any[];
  filename: string;
}

export default function ExportCsvButton({ rows, filename }: ExportCsvButtonProps) {
  const handleExport = () => {
    const headers = [
      "Performance",
      "Date",
      "Capacity",
      "Tickets Sold",
      "Gross",
      "Comps Issued",
      "Total Allocated",
      "% of Capacity",
      "Remaining",
    ];

    const escapeCsv = (value: any): string => {
      const str = value == null ? "" : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = rows.map((row) =>
      [
        row.performance,
        row.date,
        row.capacity,
        row.ticketsSold,
        row.gross,
        row.compsIssued,
        row.totalAllocated,
        row.utilisationPct != null ? row.utilisationPct : "",
        row.remaining != null ? row.remaining : "",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-mv-blue text-white rounded-[3px] px-4 py-2 text-sm font-medium hover:bg-mv-navy-muted transition-colors"
    >
      Export CSV
    </button>
  );
}