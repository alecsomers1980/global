const accentMap = {
  navy: "bg-mv-navy",
  blue: "bg-mv-blue",
  mint: "bg-mv-mint",
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "navy" | "blue" | "mint";
}

export default function StatCard({ label, value, hint, accent = "navy" }: StatCardProps) {
  const barClass = accentMap[accent] ?? accentMap.navy;

  return (
    <div className="relative overflow-hidden border border-mv-line rounded shadow-card p-5">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t ${barClass}`} />
      <div className="uppercase text-[11px] tracking-wide text-mv-navy-muted">{label}</div>
      <div className="font-heading text-3xl text-mv-navy mt-1">{value}</div>
      {hint && <div className="text-xs text-mv-navy-muted mt-1">{hint}</div>}
    </div>
  );
}