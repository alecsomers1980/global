import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Insights",
    description: "Legal insights and updates from Roets & Van Rensburg Inc. — Road Accident Fund claims, litigation, and South African law.",
    alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from("insights_posts")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Insights
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Stay informed with the latest legal insights.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16 px-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/insights/${post.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden bg-gray-100 relative">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-2">
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-gold transition-colors mb-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      {post.published_at && (
                        <time className="text-xs text-gray-400">
                          {new Date(post.published_at).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No insights published yet. Check back soon.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
