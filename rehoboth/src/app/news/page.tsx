import type { Metadata } from "next";
import { getNews } from "@/lib/news";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { NewsCard } from "@/components/news/NewsCard";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "News",
  description:
    "Harvests, new products and what is happening at Rehoboth Farm in Low's Creek, Mpumalanga.",
};

export default async function NewsIndexPage() {
  const posts = await getNews();

  return (
    <>
      <Header />
      <PageBanner
        eyebrow="From the farm"
        title="Latest news"
        lead="Harvests, new products, and where to find us."
      />
      <main className="mx-auto max-w-[1440px] px-6 md:px-16">
        {posts.length === 0 ? (
          <p className="py-20 text-[17px] text-ink-mute">
            Nothing here just yet. Come back soon.
          </p>
        ) : (
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.06}>
                <NewsCard post={post} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
