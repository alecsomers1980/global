import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || "",
    image: post.hero_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "Woodpecker Guesthouse" },
    publisher: { "@type": "Organization", name: "Woodpecker Guesthouse" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-6 py-16">
        {post.hero_image ? (
          <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-8 bg-sand/40">
            <Image src={post.hero_image} alt={post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/9] rounded-xl mb-8 bg-sand/40" />
        )}
        {post.category && (
          <p className="text-terracotta text-xs font-medium uppercase tracking-wide mb-2">{post.category}</p>
        )}
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">{post.title}</h1>
        {post.published_at && (
          <time className="block text-muted text-sm mb-8">
            {new Date(post.published_at).toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        <div className="article-body">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </main>
    </>
  );
}