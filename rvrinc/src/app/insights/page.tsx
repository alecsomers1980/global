import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";

export default async function InsightsPage() {
    const supabase = createClient();
    const { data: blogPosts } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_date", { ascending: false });
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                <section className="bg-brand-navy py-16 text-center text-white">
                    <div className="container">
                        <h1 className="text-4xl font-serif font-bold mb-4">Legal Insights</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Stay informed with the latest legal news, analysis, and updates from our expert team.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts?.map((post: BlogPost) => (
                            <div key={post.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
                                {/* Image Placeholder */}
                                <div className="h-48 bg-gray-200 w-full relative">
                                    <div className="absolute inset-0 bg-brand-navy/10 flex items-center justify-center text-brand-navy/20 font-bold">
                                        {post.category}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {post.published_date}</span>
                                        <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {post.author}</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-brand-navy mb-3 line-clamp-2 group-hover:text-brand-gold transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-muted-foreground mb-6 line-clamp-3 text-sm flex-1">
                                        {post.excerpt}
                                    </p>

                                    <Link href={`/insights/${post.slug}`} className="mt-auto">
                                        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-brand-navy font-semibold hover:text-brand-gold hover:underline justify-start">
                                            Read Full Article <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
