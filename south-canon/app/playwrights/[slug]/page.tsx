import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { getPlaywrightBySlug, listPlaywrightSlugs } from '@/lib/playwrights'
import { playwrightSchema } from '@/lib/seo'

export const revalidate = 300

export async function generateStaticParams() {
  return (await listPlaywrightSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const w = await getPlaywrightBySlug((await params).slug)
  if (!w) return {}
  return {
    title: w.name,
    description: w.bio?.slice(0, 155) ?? `Plays by ${w.name}, represented by South Canon.`,
  }
}

export default async function PlaywrightPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = await getPlaywrightBySlug((await params).slug)
  if (!w) notFound()

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playwrightSchema(w)) }}
      />
      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        {w.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.portraitUrl} alt={w.name} className="aspect-square w-60 object-cover" />
        ) : (
          <div />
        )}
        <div>
          <h1 className="font-display text-5xl md:text-6xl">{w.name}</h1>
          {w.country && <p className="mt-2 text-muted">{w.country}</p>}
          {w.honours.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-accent">
              {w.honours.map((h) => (
                <li key={h} className="border border-accent/30 px-3 py-1">{h}</li>
              ))}
            </ul>
          )}
          {w.bio && <p className="mt-6 max-w-2xl whitespace-pre-line">{w.bio}</p>}
        </div>
      </div>

      {w.plays.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Plays</h2>
          <div className="mt-4">
            {w.plays.map((p) => (
              <PlayCard key={p.id} play={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}