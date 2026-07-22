export const revalidate = 3600;

import { createPublicClient } from "@/lib/supabase/public";
import PageBanner from "@/components/site/PageBanner";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

function supabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!supabaseConfigured()) return { title: "Journal" };
  const supabase = createPublicClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("meta_title, meta_description, title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    return { title: "Not found" };
  }

  return {
    title: post.meta_title || post.title || "Journal",
    description: post.meta_description || post.excerpt || "",
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  if (!supabaseConfigured()) notFound();
  const supabase = createPublicClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || undefined,
    image: post.image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    publisher: {
      "@type": "Organization",
      name: "Diana's Bulbinella",
    },
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/blog/${slug}`,
  };

  return (
    <div className="relative">
      <div className="relative z-10">
        {post.image_url ? (
          <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </section>
        ) : (
          <PageBanner eyebrow="JOURNAL" title={post.title} />
        )}

        <article className="py-16 px-6">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-6 inline-block text-sm text-forest underline underline-offset-4 hover:text-aurora-gold"
            >
              ← Back to the Journal
            </Link>

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-deep">
              {post.category}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-forest md:text-5xl">
              {post.title}
            </h1>
            <time className="mt-4 block text-sm text-muted" dateTime={post.published_at}>
              {new Date(post.published_at!).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <div className="mt-8 h-px w-16 bg-amber/50" />

            <div className="article-body mt-10">
              <ReactMarkdown>{post.content || ""}</ReactMarkdown>
            </div>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      </div>
    </div>
  );
}
