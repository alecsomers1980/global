import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog";

export const revalidate = 60; // ISR: new/approved posts go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides to Hazyview, the Panorama Route and Kruger National Park from Woodpecker Guesthouse.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Blog</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Travel guides and local tips for Hazyview, the Panorama Route and Kruger National Park.
      </p>
      {posts.length === 0 ? (
        <p className="text-muted">Articles are being added — check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-sand/40 relative">
                {post.hero_image && (
                  <Image src={post.hero_image} alt={post.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                {post.category && (
                  <p className="text-terracotta text-xs font-medium uppercase tracking-wide mb-1">
                    {post.category}
                  </p>
                )}
                <p className="text-ink font-medium">{post.title}</p>
                {post.excerpt && <p className="text-muted text-sm mt-1 line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}