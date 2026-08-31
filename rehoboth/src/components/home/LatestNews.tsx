import Link from "next/link";
import { getNews } from "@/lib/news";
import { Reveal } from "@/components/motion/Reveal";
import { NewsCard } from "@/components/news/NewsCard";

/**
 * The three most recent articles.
 *
 * Renders nothing at all until something is published. An empty "Latest news"
 * heading with a blank space under it makes a shop look abandoned, which is
 * worse than not mentioning news at all.
 */
export async function LatestNews() {
  const posts = await getNews(3);
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-6 pt-24 md:px-16">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-brand">From the farm</p>
          <h2 className="font-display text-3xl text-ink md:text-[46px]">Latest news</h2>
        </div>
        <Link href="/news" className="border-b border-hairline pb-1 text-sm text-ink hover:text-brand">
          All news
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.07}>
            <NewsCard post={post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
