import type { Metadata } from 'next'
import Link from 'next/link'
import { Bodoni_Moda } from 'next/font/google'
import { Container } from '@/components/ui/Container'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'South Canon — Theatre from the South, licensed worldwide',
  description:
    'South Canon represents playwrights across Africa and the global South, licensing their work for performance worldwide.',
}

const NAV = [
  { href: '#catalogue', label: 'Plays' },
  { href: '#catalogue', label: 'Authors' },
  { href: '#catalogue', label: 'Catalogue' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export default function ComingSoonPage() {
  return (
    <div className="bg-onyx text-ivory">
      {/* Hero */}
      <section className="px-4 pt-4 pb-16 md:px-8 md:pt-8 md:pb-28">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-ivory text-onyx shadow-2xl">
          <nav className="flex items-center justify-between border-b border-onyx/10 px-6 py-5 md:px-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/southcanon-logo-onyx.png" alt="South Canon" className="h-4 md:h-5" />
            <ul className="hidden gap-8 text-xs font-medium tracking-wide text-onyx/70 uppercase md:flex">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-canon-red">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              aria-label="Menu"
              className="flex flex-col gap-1.5 md:hidden"
            >
              <span className="block h-0.5 w-6 bg-canon-red" />
              <span className="block h-0.5 w-6 bg-canon-red" />
            </a>
          </nav>

          <div className="px-6 py-16 md:px-14 md:py-24">
            <h1
              className={`${bodoni.className} text-4xl leading-[1.08] font-medium tracking-tight md:text-6xl lg:text-7xl`}
            >
              Theatre from the south.
              <br />
              <em className="italic">Licensed worldwide.</em>
            </h1>
            <div className="mt-8 h-1 w-16 bg-canon-red" />
            <p className="mt-8 max-w-md text-base text-onyx/70 md:text-lg">
              South Canon represents playwrights across Africa and the global South &mdash;
              licensing their work for performance worldwide, and making sure the writers who made
              it are paid, on time, in full.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-ivory/10 bg-onyx px-6 py-8 text-ivory sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-14">
            <p className="pt-4 text-xs font-medium tracking-wide uppercase sm:pt-0 sm:pr-6">
              Contemporary voices
            </p>
            <p className="pt-4 text-xs font-medium tracking-wide uppercase sm:px-6 sm:pt-0">
              Powerful stories.
              <br className="hidden sm:block" /> Global stage.
            </p>
            <Link
              href="/contact"
              className="pt-4 text-xs font-medium tracking-wide text-canon-red uppercase hover:opacity-80 sm:pt-0 sm:pl-6"
            >
              Licensing enquiries &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-ivory/10 py-24">
        <Container>
          <p className="text-xs font-medium tracking-[0.25em] text-canon-red uppercase">
            About South Canon
          </p>
          <h2 className={`${bodoni.className} mt-6 max-w-2xl text-3xl font-medium md:text-5xl`}>
            The leading rights home for theatre from the African continent.
          </h2>
          <p className="mt-8 max-w-2xl text-lg text-ivory/70">
            We license plays for performance to schools, community theatres, professional
            producers and international companies. Every writer we represent gets a full account
            of where their work is playing, what it has earned, and when they will be paid &mdash;
            no exceptions.
          </p>
        </Container>
      </section>

      {/* Pillars */}
      <section className="border-t border-ivory/10 py-24">
        <Container>
          <div className="grid gap-12 md:grid-cols-3 md:gap-10">
            {[
              {
                title: 'Rights, protected',
                body: 'Clear licensing terms and territory-by-territory availability, administered properly.',
              },
              {
                title: 'Writers, paid',
                body: 'Full visibility into every production and every royalty &mdash; the thing the old system never gave them.',
              },
              {
                title: 'A global stage',
                body: 'Representing playwrights across Africa and the global South to producers worldwide.',
              },
            ].map((p) => (
              <div key={p.title}>
                <div className="h-0.5 w-10 bg-canon-red" />
                <h3 className={`${bodoni.className} mt-6 text-2xl font-medium`}>{p.title}</h3>
                <p className="mt-3 text-ivory/60">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Catalogue teaser */}
      <section id="catalogue" className="border-t border-ivory/10 py-24">
        <Container>
          <p className="text-xs font-medium tracking-[0.25em] text-canon-red uppercase">
            Our first writer
          </p>
          <h2 className={`${bodoni.className} mt-6 max-w-2xl text-3xl font-medium md:text-5xl`}>
            Paul Slabolepszy.
          </h2>
          <p className="mt-8 max-w-2xl text-lg text-ivory/70">
            One of South Africa&rsquo;s most decorated playwrights &mdash; author of{' '}
            <em className={`${bodoni.className} italic`}>Saturday Night at the Palace</em> and a
            catalogue of work spanning four decades. The first of the writers South Canon
            represents, with more to follow.
          </p>
        </Container>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-ivory/10 py-24">
        <Container>
          <p className="text-xs font-medium tracking-[0.25em] text-canon-red uppercase">
            Get in touch
          </p>
          <h2 className={`${bodoni.className} mt-6 max-w-xl text-3xl font-medium md:text-5xl`}>
            The full catalogue is on its way. Licensing enquiries are open now.
          </h2>
          <Link
            href="/contact"
            className="mt-10 inline-block bg-canon-red px-8 py-4 text-sm font-medium tracking-wide text-ivory uppercase hover:opacity-90"
          >
            Contact South Canon &rarr;
          </Link>
        </Container>
      </section>

      <footer className="border-t border-ivory/10 py-10">
        <Container className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/southcanon-logo-ivory.png" alt="South Canon" className="h-4" />
          <p className="text-xs text-ivory/50">
            &copy; {new Date().getFullYear()} South Canon. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  )
}
