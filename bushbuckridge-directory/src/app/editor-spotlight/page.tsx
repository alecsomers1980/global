import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Quote } from 'lucide-react'

async function getSpotlight() {
  try {
    const pb = await createClient()
    const record = await pb
      .collection('editor_spotlight')
      .getFirstListItem('is_active=true', { sort: '-created' })
    return record
  } catch {
    return null
  }
}

function fileUrl(base: string, collectionId: string, recordId: string, img: string) {
  return `${base}/api/files/${collectionId}/${recordId}/${img}`
}

function GalleryGrid({
  images,
  getSrc,
}: {
  images: string[]
  getSrc: (img: string) => string
}) {
  if (!images.length) return null
  return (
    <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
      {images.map((img, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img}
          src={getSrc(img)}
          alt={`Gallery image ${idx + 1}`}
          className="aspect-[4/3] w-full rounded-lg object-cover shadow-md"
          loading="lazy"
        />
      ))}
    </div>
  )
}

function Signature({
  heroSrc,
  name,
  title,
}: {
  heroSrc: string
  name: string
  title: string
}) {
  return (
    <div className="mt-16 flex items-center gap-4 border-t border-stone-200 pt-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroSrc}
        alt={name}
        className="h-14 w-14 rounded-full object-cover ring-2 ring-stone-200"
      />
      <div>
        <p className="text-sm font-semibold text-stone-900">{name}</p>
        {title && <p className="text-sm text-stone-600">{title}</p>}
      </div>
    </div>
  )
}

export default async function EditorSpotlightPage() {
  const spotlight = await getSpotlight()
  if (!spotlight) {
    notFound()
  }

  const base = process.env.NEXT_PUBLIC_POCKETBASE_URL!
  const collectionId = spotlight.collectionId
  const recordId = spotlight.id

  const getSrc = (img: string) => fileUrl(base, collectionId, recordId, img)

  const galleryImages: string[] = Array.isArray(spotlight.images)
    ? spotlight.images
    : []

  const heroSrc =
    galleryImages.length > 0
      ? getSrc(galleryImages[0])
      : spotlight.image
        ? fileUrl(base, collectionId, recordId, spotlight.image)
        : '/ophelia-mnisi.jpg'

  const galleryExtras = galleryImages.slice(1)

  const layout = (spotlight.layout as string) || 'default'
  const displayName = spotlight.name || 'Editor Spotlight'
  const displayTitle = spotlight.title || ''
  const displayQuote = spotlight.short_description || ''
  const displayDescription = spotlight.full_description || ''

  return (
    <main className="min-h-screen bg-white">
      {/* ========== DEFAULT LAYOUT ========== */}
      {layout === 'default' && (
        <>
          {/* Hero band */}
          <section className="relative flex h-[50vh] min-h-[380px] items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur">
                Editor Spotlight
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {displayName}
              </h1>
              {displayTitle && (
                <p className="mt-2 text-lg font-medium text-white/80">{displayTitle}</p>
              )}
              {displayQuote && (
                <div className="mt-4 flex items-start justify-center gap-2 text-white/70 italic">
                  <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-white/60" />
                  <p className="max-w-xl text-sm leading-relaxed">{displayQuote}</p>
                </div>
              )}
            </div>
          </section>

          {/* Article column */}
          <div className="mx-auto max-w-3xl px-4 py-12">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Mobile avatar (hidden on desktop) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={displayName}
              className="mx-auto mb-8 h-24 w-24 rounded-full object-cover shadow ring-2 ring-stone-200 md:hidden"
            />

            {displayQuote && (
              <div className="mb-10 border-l-4 border-stone-200 pl-4 italic text-stone-600">
                <p className="text-lg leading-relaxed">{displayQuote}</p>
              </div>
            )}

            <article
              className="prose prose-lg max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-800"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <GalleryGrid images={galleryExtras} getSrc={getSrc} />

            <Signature heroSrc={heroSrc} name={displayName} title={displayTitle} />
          </div>
        </>
      )}

      {/* ========== HERO TOP LAYOUT ========== */}
      {layout === 'hero_top' && (
        <>
          <section className="relative flex h-[60vh] min-h-[500px] items-end overflow-hidden md:h-[75vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 w-full px-4 pb-12 text-white md:pb-16">
              <div className="mx-auto max-w-3xl">
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur">
                  Editor Spotlight
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {displayName}
                </h1>
                {displayTitle && (
                  <p className="mt-2 text-lg font-medium text-white/80">{displayTitle}</p>
                )}
                {displayQuote && (
                  <div className="mt-4 flex items-start gap-2 text-white/70 italic">
                    <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-white/60" />
                    <p className="max-w-xl text-sm leading-relaxed">{displayQuote}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-3xl px-4 py-12">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={displayName}
              className="mx-auto mb-8 h-24 w-24 rounded-full object-cover shadow ring-2 ring-stone-200 md:hidden"
            />

            {displayQuote && (
              <div className="mb-10 border-l-4 border-stone-200 pl-4 italic text-stone-600">
                <p className="text-lg leading-relaxed">{displayQuote}</p>
              </div>
            )}

            <article
              className="prose prose-lg max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-800"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <GalleryGrid images={galleryExtras} getSrc={getSrc} />

            <Signature heroSrc={heroSrc} name={displayName} title={displayTitle} />
          </div>
        </>
      )}

      {/* ========== GALLERY GRID LAYOUT ========== */}
      {layout === 'gallery_grid' && (
        <>
          {/* Full gallery grid at the top */}
          <div className="mx-auto max-w-6xl px-4 pt-12">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((img, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img}
                  src={getSrc(img)}
                  alt={`${displayName} image ${idx + 1}`}
                  className="aspect-[4/3] w-full rounded-lg object-cover shadow-md"
                />
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {displayName}
            </h1>
            {displayTitle && (
              <p className="mt-2 text-lg font-medium text-stone-600">{displayTitle}</p>
            )}
            {displayQuote && (
              <div className="mt-4 flex items-start gap-2 italic text-stone-600">
                <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-stone-400" />
                <p className="text-sm leading-relaxed">{displayQuote}</p>
              </div>
            )}

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <article
              className="prose prose-lg mt-10 max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-800"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <Signature heroSrc={heroSrc} name={displayName} title={displayTitle} />
          </div>
        </>
      )}
    </main>
  )
}