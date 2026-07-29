import type { PlayMedia } from '@/lib/types'

export function MediaGallery({ media }: { media: PlayMedia[] }) {
  if (media.length === 0) return null
  const photos = media.filter((m) => m.type === 'photo')
  const videos = media.filter((m) => m.type === 'video')

  return (
    <section>
      <h2 className="font-display text-3xl">Media</h2>
      {photos.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {photos.map((p) => (
            <figure key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? ''} className="w-full object-cover" />
              {(p.caption || p.credit) && (
                <figcaption className="mt-2 text-xs text-muted">
                  {[p.caption, p.credit].filter(Boolean).join(' · ')}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div className="mt-6 space-y-6">
          {videos.map((v) => (
            <div key={v.id} className="aspect-video">
              <iframe
                src={v.url}
                title={v.caption ?? 'Production video'}
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
