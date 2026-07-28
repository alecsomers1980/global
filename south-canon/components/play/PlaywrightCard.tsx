import Link from 'next/link'
import type { Playwright } from '@/lib/types'

export function PlaywrightCard({ playwright }: { playwright: Playwright }) {
  return (
    <section className="grid gap-6 border-t border-rule pt-8 md:grid-cols-[160px_1fr]">
      {playwright.portraitUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={playwright.portraitUrl}
          alt={playwright.name}
          className="aspect-square w-40 object-cover"
        />
      ) : (
        <div />
      )}
      <div>
        <h2 className="font-display text-3xl">{playwright.name}</h2>
        {playwright.bio && <p className="mt-3 max-w-2xl text-muted">{playwright.bio}</p>}
        <Link
          href={`/playwrights/${playwright.slug}`}
          className="mt-4 inline-block text-sm uppercase tracking-wide text-accent hover:underline"
        >
          View full profile
        </Link>
      </div>
    </section>
  )
}
