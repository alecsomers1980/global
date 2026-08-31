import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNews, getNewsBySlug, newsDate, plainText } from "@/lib/news";
import { screen } from "@/lib/compliance";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, DEFAULT_OG_IMAGE, newsArticleJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getNews();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};

  const description = post.excerpt?.trim() || plainText(post.body).slice(0, 155);
  const url = absoluteUrl(`/news/${post.slug}`);
  const image = post.heroImage ?? DEFAULT_OG_IMAGE.url;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  /**
   * The admin screens an article before it saves, so this should never fire.
   * It is here because a page is also built from whatever is in the database,
   * and a row written straight into Supabase would otherwise reach the public
   * site unscreened. Failing the build is the correct outcome.
   */
  const check = screen(post.title, post.excerpt, plainText(post.body));
  if (check.flagged) {
    throw new Error(`Compliance: news "${post.slug}" contains ${check.hits.join(", ")}`);
  }

  const others = (await getNews(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={newsArticleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: post.title, path: `/news/${post.slug}` },
        ])}
      />
      <Header />
      <main>
        <article className="mx-auto max-w-[760px] px-6 md:px-16">
          <nav className="py-6 text-sm text-ink-mute">
            <Link href="/news" className="hover:text-brand">
              News
            </Link>
            <span className="px-2">/</span>
            <span className="text-ink">{post.title}</span>
          </nav>

          <p className="text-xs uppercase tracking-[0.2em] text-brand">
            {newsDate(post.publishedAt)}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink md:text-[52px]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-[19px] leading-relaxed text-ink-soft">{post.excerpt}</p>
          )}

          {post.heroImage && (
            <div className="relative mt-10 aspect-[3/2] overflow-hidden bg-surface">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 760px"
                className="object-cover"
              />
            </div>
          )}

          {/* The body is HTML the editor produced. Only an admin can write it,
              and the editor parses anything pasted into its own schema, so
              what is stored cannot carry script. */}
          <div
            className="reh-prose mt-10"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <div className="mt-14">
            <DisclaimerBlock />
          </div>
        </article>

        {others.length > 0 && (
          <section className="mx-auto mt-20 max-w-[1440px] border-t border-hairline px-6 pt-14 md:px-16">
            <h2 className="mb-10 font-display text-2xl text-ink">More from the farm</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <NewsCardServer key={p.slug} slug={p.slug} title={p.title} date={p.publishedAt} image={p.heroImage} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

/** A compact card — the full one carries a summary this row has no space for. */
function NewsCardServer({
  slug,
  title,
  date,
  image,
}: {
  slug: string;
  title: string;
  date: string | null;
  image: string | null;
}) {
  return (
    <Link href={`/news/${slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-brand">{newsDate(date)}</p>
      <h3 className="font-display text-[20px] leading-snug text-ink group-hover:text-brand-deep">
        {title}
      </h3>
    </Link>
  );
}
