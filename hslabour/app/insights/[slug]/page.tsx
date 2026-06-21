import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { type Metadata } from "next";
import { getPostBySlug, getPublishedSlugs } from "@/lib/insights/queries";
import Container from "@/components/site/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    alternates: { canonical: `/insights/${slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.image_url ? [post.image_url] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || post.meta_description}
        image={post.image_url}
        datePublished={post.published_at}
        slug={post.slug}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Insights", path: "/insights" },
          { name: post.title, path: `/insights/${post.slug}` },
        ]}
      />

      {post.image_url && (
        <section className="relative h-[38vh] w-full sm:h-[48vh]">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy/50" />
        </section>
      )}

      <article className="bg-white py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/insights"
              className="text-sm font-semibold text-green-dark hover:text-green"
            >
              ← All insights
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-dark">
              {post.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
              {post.title}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
            <div className="mt-8 text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-navy [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:leading-relaxed [&_a]:text-green-dark [&_a]:underline [&_strong]:text-navy [&_strong]:font-semibold">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}