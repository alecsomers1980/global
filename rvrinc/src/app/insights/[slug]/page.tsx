import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const supabase = createClient();

  const { data: post } = await supabase
    .from("insights_posts")
    .select("meta_title, meta_description, title")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || "",
    alternates: { canonical: `/insights/${slug}` },
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = createClient();

  const { data: post, error } = await supabase
    .from("insights_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (error || !post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || "",
    image: post.image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    publisher: {
      "@type": "Organization",
      name: "Roets & Van Rensburg Inc.",
    },
    mainEntityOfPage: `${SITE_URL}/insights/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <main>
        {/* Hero Image */}
        {post.image_url && (
          <section className="w-full h-[40vh] md:h-[50vh] relative">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </section>
        )}

        {/* Article Content */}
        <article className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            {post.category && (
              <span className="inline-block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            {post.published_at && (
              <time className="block text-sm text-gray-500 mb-8">
                {new Date(post.published_at).toLocaleDateString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}

            <div className="border-t pt-8 prose prose-brand max-w-none">
              <ReactMarkdown>
                {post.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
