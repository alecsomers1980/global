import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Quote } from 'lucide-react'

async function getSpotlight() {
  try {
    const pb = await createClient()
    const record = await pb.collection('editor_spotlight').getFirstListItem(
      'is_active=true',
      { sort: '-created' }
    )
    return record
  } catch {
    return null
  }
}

export default async function EditorSpotlightPage() {
  const spotlight = await getSpotlight()

  if (!spotlight) {
    notFound()
  }

  const imageUrl = spotlight.image
    ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${spotlight.collectionId}/${spotlight.id}/${spotlight.image}`
    : '/ophelia-mnisi.jpg'

  const displayName = spotlight.name || 'Editor Spotlight'
  const displayTitle = spotlight.title || ''
  const displayQuote = spotlight.short_description || ''
  const displayDescription = spotlight.full_description || ''

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/50 to-stone-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-2xl space-y-5">
              <Badge
                variant="secondary"
                className="bg-white/10 text-white/90 backdrop-blur-sm border-white/10 hover:bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              >
                Editor Spotlight
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight">
                {displayName}
              </h1>

              {displayTitle && (
                <p className="text-lg sm:text-xl text-white/75 font-light leading-relaxed">
                  {displayTitle}
                </p>
              )}

              {displayQuote && (
                <div className="flex items-start gap-3 pt-2">
                  <Quote className="w-5 h-5 text-amber-400/80 mt-1 shrink-0 rotate-180" />
                  <p className="text-white/60 italic font-light text-base leading-relaxed">
                    {displayQuote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="relative">
        {/* Decorative top border */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1B4332] via-[#2d5a47] to-[#1B4332]" />

        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
          {/* Back Navigation */}
          <div className="mb-10 sm:mb-14">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="group -ml-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Featured Image for Content (visible on smaller viewports as a visual anchor) */}
          <div className="lg:hidden mb-10 sm:mb-14 flex justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>

          {/* Article Body */}
          {displayDescription && (
            <article className="max-w-3xl mx-auto">
              <div
                className="
                  prose prose-stone prose-lg
                  prose-headings:font-serif prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-bold prose-h2:text-stone-900 prose-h2:mt-14 prose-h2:mb-5
                  prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:font-semibold prose-h3:text-stone-800 prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-stone-600 prose-p:leading-relaxed prose-p:font-light
                  prose-a:text-amber-700 prose-a:font-normal prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-stone-800 prose-strong:font-semibold
                  prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                  prose-blockquote:text-stone-700 prose-blockquote:not-italic prose-blockquote:font-light
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-ul:text-stone-600 prose-ol:text-stone-600
                  prose-li:font-light
                  first-prose-p:first-letter:text-5xl first-prose-p:first-letter:font-serif first-prose-p:first-letter:font-bold first-prose-p:first-letter:text-stone-900 first-prose-p:first-letter:float-left first-prose-p:first-letter:mr-3 first-prose-p:first-letter:mt-1 first-prose-p:first-letter:leading-none
                "
                dangerouslySetInnerHTML={{ __html: displayDescription }}
              />
            </article>
          )}

          {/* Footer Signature */}
          <div className="max-w-3xl mx-auto mt-16 sm:mt-20 pt-10 border-t border-stone-200">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-stone-200 shrink-0">
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="font-serif font-semibold text-stone-900 text-lg">
                  {displayName}
                </p>
                {displayTitle && (
                  <p className="text-stone-500 text-sm font-light">
                    {displayTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
