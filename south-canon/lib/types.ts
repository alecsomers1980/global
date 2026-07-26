export type CreditRole = 'book' | 'music' | 'lyrics' | 'translation' | 'adaptation' | 'author'
export type AvailabilityStatus = 'available' | 'restricted' | 'unavailable'

export type PlayCredit = { name: string; slug: string; role: CreditRole }

export type Playwright = {
  id: string
  name: string
  slug: string
  bio: string | null
  portraitUrl: string | null
  country: string | null
  honours: string[]
  representedSince: string | null
}

export type PlaySummary = {
  id: string
  title: string
  slug: string
  logline: string | null
  genres: string[]
  durationMin: number | null
  heroImageUrl: string | null
  castSummary: string
  credits: PlayCredit[]
}
