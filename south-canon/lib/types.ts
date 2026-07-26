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

export type RoleGender = 'male' | 'female' | 'any'

export type CastRole = {
  id: string
  name: string
  gender: RoleGender
  ageRange: string | null
  description: string | null
  isEnsemble: boolean
  sort: number
}

export type PlayMedia = {
  id: string
  type: 'photo' | 'video'
  url: string
  caption: string | null
  credit: string | null
}

export type PressQuote = {
  id: string
  quote: string
  source: string
  publishedAt: string | null
}

export type Production = {
  id: string
  company: string
  venue: string | null
  city: string | null
  country: string | null
  startsOn: string | null
  endsOn: string | null
  director: string | null
  notes: string | null
  isPremiere: boolean
}
