import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Byline({
  author,
  publishedAt,
  onDark = false,
}: {
  author: string | null;
  publishedAt: string | null;
  onDark?: boolean;
}) {
  const color = onDark ? { color: 'var(--brand-hero-muted)' } : undefined;

  return (
    <div className="flex items-center gap-3 meta-text" style={color}>
      {author && (
        <span>
          By <span className="font-bold">{author}</span>
        </span>
      )}
      {publishedAt && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(publishedAt), 'MMMM d, yyyy')}
        </span>
      )}
    </div>
  );
}