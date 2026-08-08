interface HighlightListProps {
  highlights: { title: string; body: string }[];
  title?: string;
}

export function HighlightList({
  highlights,
  title = 'Highlights',
}: HighlightListProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section>
      <h2>{title}</h2>

      <ol className="space-y-6">
        {highlights.map((item, index) => (
          <li key={index} className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide3 text-amber">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-sm tracking-wide2">{item.title}</h3>
            <p className="text-sm leading-relaxed text-text/70 normal-case">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
