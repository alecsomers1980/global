interface BreakdownItem {
  name: string;
  count: number;
  seats: number;
}

interface BreakdownListProps {
  title: string;
  items: BreakdownItem[];
}

export default function BreakdownList({ title, items }: BreakdownListProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="border border-mv-line rounded shadow-card p-5">
      <h3 className="font-heading text-mv-navy text-sm uppercase tracking-wide mb-4">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-mv-navy-muted">No data yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-mv-navy truncate">{item.name}</span>
                <span className="text-xs text-mv-navy-muted shrink-0 ml-2">
                  {item.count} · {item.seats} seats
                </span>
              </div>
              <div className="w-full h-1.5 bg-mv-line rounded-full">
                <div
                  className="h-full bg-mv-blue rounded-full"
                  style={{
                    width: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}