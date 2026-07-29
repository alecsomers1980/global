import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/media";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { Clock, User, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PREMIUM_DEMO_CONTENT } from "@/lib/demo-content";
import ProgressBar from "./ProgressBar";

export const revalidate = 60;

function stripHtml(html: string) {
    if (!html) return "";
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\sn\s/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'publish')
        .single();

    // Check if we have premium demo content for this slug
    const demo = PREMIUM_DEMO_CONTENT[slug];

    if (!demo && (error || !post)) {
        notFound();
    }

    const imageUrl = post ? getImageUrl(post.featured_image) : "/placeholder-news.jpg";

    // Dynamic fallbacks for premium demo content
    const displayTitle = demo?.title || post?.title || "Regional News Update";
    const displayContent = demo?.content || post?.content || "Content currently being digitized for regional archives.";
    const displayTag = demo?.tag || (post?.categories ? "Editorial" : "Regional News");
    const displayDate = demo?.updated_at || post?.published_at || new Date().toISOString();

    // Get "Latest Reports" for the sidebar (simple static list based on demo keys for now)
    const latestReports = Object.entries(PREMIUM_DEMO_CONTENT)
        .filter(([key]) => key !== slug)
        .slice(0, 3)
        .map(([key, value]) => ({ slug: key, ...value }));

    return (
        <main className="min-h-screen bg-[#FDFCFB] text-zinc-900 font-sans selection:bg-[#E60000] selection:text-white">
            <ProgressBar />
            <Navbar />

            {/* Breadcrumb / Top Bar Area */}
            <div className="pt-[120px] bg-white border-b border-zinc-100">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <nav className="flex items-center gap-3 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400">
                        <Link href="/" className="hover:text-[#E60000] transition-colors">Home</Link>
                        <span className="text-zinc-200">/</span>
                        <span className="text-[#E60000]">{displayTag}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400">
                            <Clock size={14} className="text-[#E60000]/50" /> 4 Min Read
                        </span>
                    </div>
                </div>
            </div>

            <article className="pb-24">
                {/* Header Context */}
                <header className="bg-white border-b border-zinc-100 mb-12">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
                        <div className="max-w-4xl">
                            <h1 className="font-display text-4xl md:text-[64px] font-bold leading-[1.05] tracking-tight text-zinc-900 mb-10 decoration-[#E60000]/20 decoration-8 underline-offset-8">
                                {displayTitle}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 text-[11px] font-sans font-bold uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-3 pr-8 border-r border-zinc-200">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
                                        <User size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-zinc-400 text-[9px] mb-0.5">Reported By</span>
                                        <span className="text-zinc-900">Editorial Staff</span>
                                    </div>
                                </div>
                                <div className="flex flex-col border-r border-zinc-200 pr-8">
                                    <span className="text-zinc-400 text-[9px] mb-0.5">Published On</span>
                                    <span className="text-zinc-900">{format(new Date(displayDate), "MMMM d, yyyy")}</span>
                                </div>
                                <button className="flex items-center gap-2.5 text-[#E60000] hover:text-zinc-900 transition-colors group">
                                    <Share2 size={16} /> <span className="pt-0.5">Share Intelligence</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                        {/* ──── CONTENT COLUMN ──── */}
                        <div className="lg:col-span-8">
                            {/* Featured Image */}
                            {imageUrl && (
                                <div className="relative w-full h-[460px] md:h-[640px] rounded-2xl overflow-hidden mb-16 shadow-2xl border border-zinc-200 group">
                                    <Image
                                        src={imageUrl}
                                        alt={displayTitle}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                                </div>
                            )}

                            {/* Meta/Summary Hook */}
                            <p className="text-xl md:text-2xl font-display font-medium text-zinc-600 mb-12 leading-relaxed border-l-4 border-l-[#E60000] pl-8 italic">
                                {demo?.excerpt || "Analyzing the regional implications of the latest developments in the Bushbuckridge trade corridors."}
                            </p>

                            {/* Main Content Body */}
                            <div
                                className="prose prose-zinc prose-lg md:prose-xl max-w-none 
                            prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-900 prose-headings:tracking-tight
                            prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mb-8 prose-h2:mt-16
                            prose-p:text-zinc-700 prose-p:leading-[1.8] prose-p:mb-8
                            prose-strong:text-zinc-900 prose-strong:font-bold
                            prose-blockquote:border-l-[#E60000] prose-blockquote:bg-white prose-blockquote:p-8 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-blockquote:font-display prose-blockquote:italic
                            prose-ul:list-disc prose-ul:pl-6 prose-li:text-zinc-700
                            prose-img:rounded-2xl prose-img:shadow-xl
                            prose-a:text-[#E60000] prose-a:font-bold prose-a:underline prose-a:underline-offset-4 decoration-2 hover:text-zinc-900 transition-colors"
                                dangerouslySetInnerHTML={{ __html: displayContent }}
                            />

                            {/* Article Footer Stats */}
                            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                                    <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-2">Accuracy Rate</div>
                                    <div className="text-2xl font-display font-bold text-zinc-900">99.8%</div>
                                </div>
                                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                                    <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-2">Sources Cited</div>
                                    <div className="text-2xl font-display font-bold text-zinc-900">12 Primary</div>
                                </div>
                                <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                                    <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-2">Global Impact</div>
                                    <div className="text-2xl font-display font-bold text-zinc-900">High</div>
                                </div>
                            </div>
                        </div>

                        {/* ──── SIDEBAR ──── */}
                        <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-[140px]">

                            {/* Latest Reports Module */}
                            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-[#E60000] rounded-full"></span> Latest Intelligence
                                </h3>
                                <div className="space-y-8">
                                    {latestReports.map((report, i) => (
                                        <Link key={i} href={`/article/${report.slug}`} className="group block">
                                            <span className="text-[9px] font-sans font-bold text-[#E60000] uppercase tracking-widest mb-2 block">{report.tag}</span>
                                            <h4 className="text-base font-display font-bold text-zinc-900 group-hover:text-[#E60000] transition-all leading-tight">
                                                {report.title}
                                            </h4>
                                        </Link>
                                    ))}
                                </div>
                                <Link href="/" className="btn-primary block text-center w-full mt-10 py-4 text-[11px] font-bold tracking-[0.2em]">
                                    Browse Full Archive
                                </Link>
                            </div>

                            {/* Regional Support Module */}
                            <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-20"></div>
                                <div className="relative z-10">
                                    <span className="text-[9px] font-sans font-bold text-[#E60000] border border-[#E60000]/30 px-2 py-1 rounded bg-[#E60000]/5 uppercase tracking-[0.2em] mb-6 inline-block">Sponsorship</span>
                                    <h4 className="text-2xl font-display font-bold text-white mb-4 leading-tight tracking-tight">Scale Your Regional Brand Impact</h4>
                                    <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-8">
                                        Position your organization at the center of the local intelligence network.
                                    </p>
                                    <Link href="/advertise" className="flex items-center gap-2.5 text-white font-sans font-bold text-[11px] uppercase tracking-[0.2em] group-hover:text-[#E60000] transition-colors">
                                        Media Kit Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* About Footer Callout */}
                            <div className="px-4">
                                <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Bushnews Protocol</h4>
                                <p className="text-[12px] leading-relaxed text-zinc-500 font-medium">
                                    Our reporting is driven by verified regional data and local ground-level insights. We uphold the highest standards of journalistic integrity in Southern Africa.
                                </p>
                            </div>

                        </aside>

                    </div>
                </div>
            </article>
        </main>
    );
}
