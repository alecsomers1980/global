import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata = {
    title: "Latest News & Guides | Everest Motoring",
    description:
        "Expert car buying guides, in-depth model reviews, and local White River motoring news from Everest Motoring — your trusted pre-owned vehicle specialists.",
};

const CATEGORY_LABEL = {
    "buying-guide": "Buying Guide",
    local: "White River",
    "model-review": "Model Review",
};

const CATEGORY_ICON = {
    "buying-guide": "menu_book",
    local: "location_on",
    "model-review": "directions_car",
};

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function estimateReadTime(bodyMd) {
    if (!bodyMd) return null;
    const words = bodyMd.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 220));
}

export default async function NewsIndexPage() {
    const supabase = await createClient();
    const { data: posts } = await supabase
        .from("news_posts")
        .select(
            "id, slug, title, excerpt, hero_image_url, category, published_at, reading_minutes, body_md"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

    const allPosts = posts || [];
    const featured = allPosts[0] || null;
    const remaining = allPosts.slice(1);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Hero Section ── */}
            <section className="relative overflow-hidden bg-slate-900 text-white">
                {/* Gradient mesh background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[120px]" />
                    <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/15 blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
                </div>
                {/* Diagonal accent line */}
                <div className="absolute inset-0 z-0 opacity-[0.03]">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px)"
                    }} />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 lg:px-12">
                    <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-sm mr-2">newspaper</span>
                        Motoring Insights
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl max-w-3xl leading-[1.05]">
                        Latest News{" "}
                        <span className="text-primary">&</span>{" "}
                        <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
                            Guides
                        </span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
                        Expert buying advice, honest model reviews, and local motoring stories
                        from the Everest Motoring team in White River.
                    </p>

                    {/* Category pills */}
                    <div className="mt-10 flex flex-wrap gap-3">
                        {Object.entries(CATEGORY_LABEL).map(([key, label]) => {
                            const count = allPosts.filter((p) => p.category === key).length;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-base text-primary">
                                        {CATEGORY_ICON[key]}
                                    </span>
                                    <span className="font-medium">{label}</span>
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-10" />
            </section>

            {/* ── Featured Article Spotlight ── */}
            {featured && (
                <section className="relative z-20 -mt-8 mx-auto max-w-7xl px-4 lg:px-12">
                    <Link
                        href={`/news/${featured.slug}`}
                        className="group block overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Image side */}
                            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-900">
                                {featured.hero_image_url ? (
                                    <Image
                                        src={featured.hero_image_url}
                                        alt={featured.title}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900">
                                        <span className="material-symbols-outlined text-6xl text-slate-700">
                                            newspaper
                                        </span>
                                    </div>
                                )}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white" />
                                {/* Category badge */}
                                <div className="absolute top-6 left-6">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-primary/30">
                                        <span className="material-symbols-outlined text-sm">
                                            {CATEGORY_ICON[featured.category] || "article"}
                                        </span>
                                        {CATEGORY_LABEL[featured.category] || "News"}
                                    </span>
                                </div>
                                {/* Featured badge */}
                                <div className="absolute top-6 right-6">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg">
                                        <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                                        Latest
                                    </span>
                                </div>
                            </div>

                            {/* Content side */}
                            <div className="flex flex-col justify-center p-8 lg:p-12">
                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                        {formatDate(featured.published_at)}
                                    </span>
                                    {(featured.reading_minutes || estimateReadTime(featured.body_md)) && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {featured.reading_minutes || estimateReadTime(featured.body_md)} min read
                                            </span>
                                        </>
                                    )}
                                </div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors duration-300">
                                    {featured.title}
                                </h2>
                                {featured.excerpt && (
                                    <p className="mt-4 text-slate-600 leading-relaxed text-base lg:text-lg line-clamp-3">
                                        {featured.excerpt}
                                    </p>
                                )}
                                <div className="mt-8 flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg group-hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                                        Read Article
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                                            arrow_forward
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* ── Article Grid ── */}
            <section className="mx-auto max-w-7xl px-4 py-20 lg:px-12">
                {remaining.length > 0 ? (
                    <>
                        <div className="mb-12 flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    More Articles
                                </h2>
                                <p className="mt-2 text-slate-500">
                                    Browse our collection of guides, reviews, and local motoring stories.
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                <span className="material-symbols-outlined text-base">article</span>
                                {allPosts.length} article{allPosts.length !== 1 ? "s" : ""}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {remaining.map((post, i) => (
                                <Link
                                    key={post.id}
                                    href={`/news/${post.slug}`}
                                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:-translate-y-1"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    {/* Card image */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                        {post.hero_image_url ? (
                                            <Image
                                                src={post.hero_image_url}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900">
                                                <span className="material-symbols-outlined text-4xl text-slate-700">
                                                    newspaper
                                                </span>
                                            </div>
                                        )}
                                        {/* Top gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        {/* Category badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-lg">
                                                <span className="material-symbols-outlined text-xs">
                                                    {CATEGORY_ICON[post.category] || "article"}
                                                </span>
                                                {CATEGORY_LABEL[post.category] || "News"}
                                            </span>
                                        </div>
                                        {/* Reading time */}
                                        <div className="absolute bottom-4 right-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white/90 text-xs rounded-md font-medium">
                                                <span className="material-symbols-outlined text-xs">schedule</span>
                                                {post.reading_minutes || estimateReadTime(post.body_md) || "3"} min
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            {formatDate(post.published_at)}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors duration-300 mb-3">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read Article
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                ) : !featured ? (
                    /* Empty state — no articles at all */
                    <div className="py-24 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                            <span className="material-symbols-outlined text-5xl text-slate-300">
                                newspaper
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Articles Coming Soon
                        </h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We&apos;re working on our first batch of car buying guides and local
                            motoring news. Subscribe below to be notified.
                        </p>
                    </div>
                ) : null}
            </section>

            {/* ── Newsletter CTA ── */}
            <section className="relative overflow-hidden bg-slate-900 px-4 py-20 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
                    <div className="absolute bottom-0 -left-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />
                </div>
                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6  backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-sm mr-2">mail</span>
                        Stay Updated
                    </div>
                    <h2 className="text-3xl font-bold md:text-4xl">
                        Never miss a{" "}
                        <span className="text-primary">great deal</span>
                    </h2>
                    <p className="mt-4 text-slate-300 text-lg">
                        Subscribe to get our latest articles, buying guides, and exclusive
                        vehicle alerts delivered to your inbox.
                    </p>
                    <div className="mt-8">
                        <NewsletterForm variant="home" />
                    </div>
                </div>
            </section>
        </div>
    );
}
