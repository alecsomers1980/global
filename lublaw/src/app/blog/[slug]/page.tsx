import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title,excerpt,content,featured_image,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      {post.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.featured_image} alt="" className="w-full h-64 object-cover rounded-2xl mb-8" />
      )}
      <h1 className="font-heading text-3xl text-maroon mb-2">{post.title}</h1>
      <p className="text-sm text-muted mb-8">
        {post.published_at && new Date(post.published_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="prose max-w-none text-ink">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
