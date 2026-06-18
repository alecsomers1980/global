import type { CompRequestRow } from "@/lib/types";

const statusStyles: Record<CompRequestRow["status"], string> = {
  REQUEST: "bg-mv-navy-muted text-mv-cream",
  "TO ISSUE": "bg-mv-blue text-mv-cream",
  ISSUED: "bg-mv-mint text-mv-navy",
  DECLINED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-300 text-mv-navy",
  "DUPLICATE/ERROR": "bg-amber-400 text-mv-navy",
};

export default function StatusBadge({ status }: { status: CompRequestRow["status"] }) {
  const classes = statusStyles[status] ?? "bg-mv-line text-mv-navy";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${classes}`}
    >
      {status}
    </span>
  );
}