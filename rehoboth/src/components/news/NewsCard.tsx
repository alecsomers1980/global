import Image from "next/image";
import Link from "next/link";
import { newsDate, plainText, type NewsPost } from "@/lib/news";

/**
 * One article, on the home page and on the news index.
 *
 * Falls back to the opening of the article when no summary was written, cut at
 * a word rather than mid-syllable — but the summary box in the admin exists so
 * that fallback is the exception.
 */
export function NewsCard({ post, priority = false }: { post: NewsPost; priority?: boolean }) {
  const summary = post.excerpt?.trim() || trim(plainText(post.body), 150);

  return (
    <Link href={`/news/${post.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <Image
              src="/brand/emblem-dark.png"
              alt=""
              width={260}
              height={247}
              className="h-14 w-auto opacity-20"
            />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-brand">{newsDate(post.publishedAt)}</p>
        <h3 className="font-display text-[22px] leading-snug text-ink group-hover:text-brand-deep">
          {post.title}
        </h3>
        {summary && <p className="text-[15px] leading-relaxed text-ink-soft">{summary}</p>}
      </div>
    </Link>
  );
}

function trim(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
