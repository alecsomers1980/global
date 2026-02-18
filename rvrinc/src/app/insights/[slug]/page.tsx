import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { BlogPost } from "@/types";



export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: post } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", params.slug)
        .single();

    const blogPost = post as unknown as BlogPost;

    if (!blogPost) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                <article className="py-20">
                    <div className="container max-w-4xl">

                        <Link href="/insights" className="inline-flex items-center text-brand-navy hover:text-brand-gold mb-8 text-sm font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
                        </Link>

                        <div className="space-y-6 text-center mb-12">
                            <span className="inline-block px-3 py-1 bg-brand-navy/5 text-brand-navy rounded-full text-xs font-semibold uppercase tracking-wider">
                                {blogPost.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-navy leading-tight">
                                {blogPost.title}
                            </h1>
                            <div className="flex items-center justify-center text-sm text-gray-500 space-x-6">
                                <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {blogPost.published_date}</span>
                                <span className="flex items-center"><User className="w-4 h-4 mr-2" /> {blogPost.author}</span>
                            </div>
                        </div>

                        <div className="aspect-video bg-gray-200 rounded-xl mb-12 w-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-brand-navy/10 flex items-center justify-center text-brand-navy/20 font-bold text-3xl">
                                Article Image
                            </div>
                        </div>

                        <div className="prose prose-lg prose-slate mx-auto">
                            <p className="lead text-xl text-gray-600 mb-8 font-medium">
                                {blogPost.excerpt}
                            </p>
                            <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
                        </div>

                        <div className="border-t border-gray-100 mt-12 pt-8 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Share this article:
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" className="rounded-full w-8 h-8">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </article>

            </main>
            <Footer />
        </div>
    );
}
