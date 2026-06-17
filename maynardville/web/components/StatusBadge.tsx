"use client";

import { CompRequestRow } from "@/lib/types";

const statusStyles: Record<string, string> = {
  REQUEST: "bg-[#3D4067] text-[#FFFADB]",
  "TO ISSUE": "bg-[#0F3193] text-[#FFFADB]",
  ISSUED: "bg-[#62DAA9] text-[#060A3C]",
  DECLINED: "bg-red-600 text-white",
};

export default function StatusBadge({ status }: { status: CompRequestRow["status"] }) {
  const colors = statusStyles[status] || "bg-gray-200 text-gray-700";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-[3px] ${colors}`}
    >
      {status}
    </span>
  );
}