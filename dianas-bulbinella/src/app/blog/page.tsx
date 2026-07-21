export const revalidate = 3600;

import { createPublicClient } from "@/lib/supabase/public";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Journal",
};

export default async function BlogPage() {
  const supabase = createPublicClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,category,image_url,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner
          eyebrow="JOURNAL"
          title="The"
          accent="Journal"
          subtitle="Botanical stories, ingredient notes and rituals from our workshop in White River."
        />

        <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
          {!posts || posts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-xl text-muted">New stories are on the way.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-line bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
                    {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-forest/10 to-aurora-gold/10" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-aurora-gold">
                      {post.category}
                    </p>
                    <h2 className="mt-1 text-lg font-medium group-hover:text-forest">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">
                      {post.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-muted">
                      {new Date(post.published_at!).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
