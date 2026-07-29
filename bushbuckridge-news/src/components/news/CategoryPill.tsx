import Link from 'next/link';

export default function CategoryPill({
  category,
  variant = 'kicker',
}: {
  category: { name: string; slug: string };
  variant?: 'kicker' | 'solid';
}) {
  if (variant === 'solid') {
    return (
      <Link
        href={`/${category.slug}`}
        className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {category.name}
      </Link>
    );
  }

  return (
    <Link href={`/${category.slug}`} className="category-kicker hover:underline">
      {category.name}
    </Link>
  );
}