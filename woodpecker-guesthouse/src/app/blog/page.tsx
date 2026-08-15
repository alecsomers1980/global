import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog";
import Reveal from "@/components/site/Reveal";

export const revalidate = 60; // ISR: new/approved posts go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides to Hazyview, the Panorama Route and Kruger National Park from Woodpecker Guesthouse.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Community &amp; Travel Tips</p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">Blog</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Travel guides and local tips for Hazyview, the Panorama Route and Kruger National Park.
        </p>
      </div>
      {posts.length === 0 ? (
        <p className="text-muted text-center">Articles are being added — check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 100}>
              <Link
                href={`/blog/${post.slug}`}
                className="group relative block h-[420px] overflow-hidden bg-sand/40"
              >
                {post.hero_image && (
                  <Image
                    src={post.hero_image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 card-scrim" />
                {post.category && (
                  <div className="absolute top-0 left-0 right-0 p-5">
                    <span className="text-white text-xs font-medium uppercase tracking-wide bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="font-display text-xl mb-2">{post.title}</p>
                  {post.excerpt && <p className="text-white/75 text-sm line-clamp-2">{post.excerpt}</p>}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}