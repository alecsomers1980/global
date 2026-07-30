import type { Metadata } from 'next'
import { Bodoni_Moda } from 'next/font/google'
import styles from './coming-soon.module.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'South Canon — Theatre from the South, licensed worldwide',
  description:
    'South Canon represents playwrights across Africa and the global South, licensing their work for performance worldwide. The catalogue opens soon.',
}

export default function ComingSoonPage() {
  return (
    <div
      className={`${styles.page} flex min-h-[100svh] flex-col items-center justify-center bg-onyx px-6 py-14 text-center sm:py-16 text-ivory`}
    >
      <p
        className={`${styles.reveal} ${styles.d1} text-[0.65rem] font-medium tracking-[0.4em] text-canon-red uppercase`}
      >
        Coming soon
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/southcanon-logo-ivory.png"
        alt="South Canon"
        className={`${styles.reveal} ${styles.d2} mt-8 h-5 w-auto sm:h-7 md:h-8`}
      />

      <h1
        className={`${bodoni.className} ${styles.reveal} ${styles.d3} mt-9 max-w-3xl text-3xl sm:mt-10 leading-[1.15] font-normal sm:text-4xl md:text-5xl`}
      >
        Theatre from the south.
        <br />
        <em className="italic">Licensed worldwide.</em>
      </h1>

      <div className={`${styles.rule} mt-9 h-px sm:mt-10 w-24 bg-canon-red`} />

      <p
        className={`${styles.reveal} ${styles.d4} mt-9 max-w-lg text-base sm:mt-10 leading-relaxed text-ivory/60 sm:text-lg`}
      >
        South Canon represents playwrights across Africa and the global South, licensing their
        work for performance worldwide &mdash; and making sure the writers who made it are paid,
        in full and on time. The catalogue opens shortly.
      </p>

      <div className={`${styles.reveal} ${styles.d5} mt-12 sm:mt-14`}>
        <p className="text-[0.65rem] font-medium tracking-[0.3em] text-ivory/40 uppercase">
          Licensing &amp; representation enquiries
        </p>
        <p className={`${bodoni.className} mt-5 text-xl text-ivory italic sm:text-2xl`}>Jaco</p>
        <a
          href="tel:+27827735397"
          className={`${styles.link} mt-2 inline-block text-base tracking-wide text-ivory/70 sm:text-lg`}
        >
          +27 82 773 5397
        </a>

        <div className="mt-8">
          <a
            href="https://wa.me/27827735397"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} inline-flex items-center gap-3 border border-ivory/25 px-7 py-3.5 text-[0.65rem] font-medium tracking-[0.25em] text-ivory uppercase`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
            </svg>
            WhatsApp Jaco
          </a>
        </div>
      </div>

      <footer
        className={`${styles.reveal} ${styles.d6} mt-12 sm:mt-14 text-[0.65rem] tracking-[0.2em] text-ivory/30 uppercase`}
      >
        &copy; {new Date().getFullYear()}{' '}
        South Canon &middot; South Africa
      </footer>
    </div>
  )
}
