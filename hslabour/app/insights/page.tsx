import Link from "next/link";
import Image from "next/image";
import { type Metadata } from "next";
import { getPublishedPosts } from "@/lib/insights/queries";
import PageHeader from "@/components/site/PageHeader";
import Container from "@/components/site/Container";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Recruitment, labour-law, payroll and career insights for South African employers and job seekers from H&S Labour Brokers.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Insights & resources"
        intro="Practical guidance on hiring, labour law, payroll, careers and the South African job market."
        imageSrc="/images/parallax/team-meeting.jpg"
        imageAlt="H&S Labour Brokers insights"
      />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          {posts.length === 0 ? (
            <p className="text-slate-600">No articles published yet — check back soon.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/insights/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {post.image_url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-dark">
                      {post.category}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-navy">{post.title}</h2>
                    {post.excerpt && (
                      <p className="mt-2 flex-1 text-sm text-slate-600">{post.excerpt}</p>
                    )}
                    <p className="mt-4 text-xs text-slate-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}