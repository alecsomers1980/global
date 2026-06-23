import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search, MapPin, Briefcase, Calendar, Star, Layers, ArrowRight, Users, Zap, Heart, Newspaper, Quote,
  Sprout, Plane, ShoppingBag, Truck, HardHat, Recycle, HeartPulse, GraduationCap,
  Factory, ShieldCheck, Palette, UtensilsCrossed,
} from 'lucide-react'

const POPULAR_CATEGORIES = [
  { name: 'Agriculture and Agri-business', icon: Sprout, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Community and Social Services', icon: Users, color: 'bg-pink-100 text-pink-700' },
  { name: 'Construction and Infrastructure', icon: HardHat, color: 'bg-amber-100 text-amber-700' },
  { name: 'Education and Training', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Food, Beverage and Licensed Trade', icon: UtensilsCrossed, color: 'bg-red-100 text-red-700' },
  { name: 'Health and Wellness', icon: HeartPulse, color: 'bg-rose-100 text-rose-700' },
  { name: 'Manufacturing and Industrial Services', icon: Factory, color: 'bg-slate-100 text-slate-700' },
  { name: 'Media, Creative and Digital Services', icon: Palette, color: 'bg-fuchsia-100 text-fuchsia-700' },
  { name: 'Professional and Business Services', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { name: 'Retail and Informal Trade', icon: ShoppingBag, color: 'bg-orange-100 text-orange-700' },
  { name: 'Security, Cleaning and Property Care', icon: ShieldCheck, color: 'bg-teal-100 text-teal-700' },
  { name: 'Tourism and Hospitality', icon: Plane, color: 'bg-sky-100 text-sky-700' },
  { name: 'Transport and Logistics', icon: Truck, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Waste and Environmental Services', icon: Recycle, color: 'bg-lime-100 text-lime-700' },
]
import { createClient } from '@/utils/pocketbase/server'

// Quick Tiles
const quickTiles = [
  { name: 'Find a Service', icon: Search, href: '/find-a-service', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Opportunities', icon: Briefcase, href: '/opportunities', color: 'bg-purple-100 text-purple-600' },
  { name: 'Jobs', icon: Users, href: '/jobs', color: 'bg-orange-100 text-orange-600' },
  { name: 'Events', icon: Calendar, href: '/events', color: 'bg-rose-100 text-rose-600' },
  { name: 'List Your Business', icon: Zap, href: '/list-your-business', color: 'bg-yellow-100 text-yellow-600' },
]

export default async function Home() {
  const pb = await createClient()

  // Fetch Featured Businesses
  let featuredList: any[] = []
  let premiumPartners: any[] = []
  try {
    const records = await pb.collection('businesses').getList(1, 3, {
      filter: 'is_featured = true && status = "active"',
      expand: 'sector,area',
    })
    featuredList = records.items

    const premiumRecords = await pb.collection('businesses').getList(1, 5, {
      filter: 'package_tier = "pro-business" && status = "active"',
      expand: 'sector,area',
    })
    premiumPartners = premiumRecords.items
  } catch (e) {
    console.error('Failed to fetch businesses', e)
  }

  // Fetch stats
  let businessCount = 0
  let jobCount = 0
  let eventCount = 0

  try {
    const [bizRes, jobRes, eventRes] = await Promise.all([
      pb.collection('businesses').getList(1, 1, { filter: 'status = "active"' }),
      pb.collection('jobs').getList(1, 1, { filter: 'status = "published"' }),
      pb.collection('events').getList(1, 1),
    ])
    businessCount = bizRes.totalItems
    jobCount = jobRes.totalItems
    eventCount = eventRes.totalItems
  } catch (e) {
    console.error('Failed to fetch stats', e)
  }

  // Fetch Spotlight Articles
  let spotlightArticles: any[] = []
  try {
    const spotlightRes = await pb.collection('spotlight_articles').getList(1, 7, {
      filter: 'status = "published"',
      sort: '-id',
      expand: 'business_id',
    })
    spotlightArticles = spotlightRes.items
  } catch (e) {
    console.error('Failed to fetch spotlight articles', e)
  }

  // Fetch Editor Spotlight
  let editorSpotlight: any = null
  try {
    const spotlightRes = await pb.collection('editor_spotlight').getList(1, 1, {
      filter: 'is_active = true',
    })
    editorSpotlight = spotlightRes.items[0] || null
  } catch (e) {
    console.error('Failed to fetch editor spotlight', e)
  }

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 text-white">
        {/* Optimized Background Image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banner.webp"
            alt="Bushbuckridge Landscape"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Dark overlay for text readability and to soften any upscaling artifacts */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>

        {/* Hero Text Overlay */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-secondary/90 text-secondary-foreground font-black px-5 py-2 text-sm uppercase tracking-widest shadow-lg">
              Bushbuckridge Community Directory
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Your Business,<br />
              <span className="text-secondary">Your Community</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Join hundreds of local businesses already connecting with customers across Bushbuckridge.
              List your business today — it is quick, affordable, and puts you on the map.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-14 px-10 text-lg font-extrabold bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-2xl shadow-xl transition-transform hover:scale-105 shadow-secondary/20" asChild>
                <Link href="/list-your-business">
                  <Zap className="mr-2 h-5 w-5" /> List Your Business
                </Link>
              </Button>
              <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 rounded-2xl shadow-xl transition-all" asChild>
                <Link href="/find-a-service">
                  <Search className="mr-2 h-5 w-5" /> Explore Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section - Floating Overlap */}
      <section className="container mx-auto px-4 -mt-12 relative z-30">
        <div className="max-w-3xl mx-auto glass-dark p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              placeholder="Search for services or businesses..."
              className="pl-12 border-0 focus-visible:ring-0 shadow-none h-14 text-lg bg-transparent text-white placeholder:text-white/40"
            />
          </div>
          <Button size="lg" className="h-14 px-10 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all rounded-xl shadow-lg shadow-secondary/20">
            Search Now
          </Button>
        </div>
      </section>

      {/* Quick Tiles - Cinematic */}
      <section className="container mx-auto px-4 mt-12 relative z-20">
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {quickTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.name}
                href={tile.href}
                className="group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border bg-card/80 backdrop-blur-xl text-card-foreground shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]"
              >
                <div className={`p-5 rounded-2xl transition-transform group-hover:scale-110 ${tile.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="font-bold text-base text-center tracking-tight">{tile.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="glass rounded-[2rem] p-8 grid grid-cols-3 divide-x divide-white/10 shadow-xl">
          <div className="text-center px-4">
            <div className="text-4xl sm:text-5xl font-extrabold text-primary">{businessCount || 142}</div>
            <div className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-widest">Businesses Listed</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl sm:text-5xl font-extrabold text-primary">{jobCount}</div>
            <div className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-widest">Active Jobs</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl sm:text-5xl font-extrabold text-primary">{eventCount}</div>
            <div className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-widest">Upcoming Events</div>
          </div>
        </div>
      </section>




      {/* Editor Spotlight */}
      {editorSpotlight && (
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1B4332] via-[#2d5a47] to-[#1B4332] text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[28rem] h-[28rem] bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-[80px]" />

          <div className="relative z-10 grid lg:grid-cols-5 gap-12 p-12 md:p-16 items-center">
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-2xl" />
                <div className="relative h-72 w-72 md:h-80 md:w-80 rounded-full overflow-hidden border-4 border-secondary/40 shadow-2xl bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editorSpotlight.image ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${editorSpotlight.collectionId}/${editorSpotlight.id}/${editorSpotlight.image}` : '/ophelia-mnisi.jpg'}
                    alt={editorSpotlight.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground font-black px-5 py-2 rounded-full shadow-xl uppercase tracking-widest text-xs">
                    Editor Spotlight
                  </Badge>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <Badge className="bg-white/10 backdrop-blur-md text-white font-bold px-4 py-1.5 border border-white/20 uppercase tracking-widest text-xs">
                In Focus
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                {editorSpotlight.name}
              </h2>
              <p className="text-xl text-secondary font-bold italic">
                {editorSpotlight.title}
              </p>
              <div className="h-1 w-24 bg-secondary rounded-full" />

              <div className="relative pl-8">
                <Quote className="absolute left-0 top-0 h-6 w-6 text-secondary/70" />
                <p className="text-white/80 text-lg font-medium leading-relaxed italic">
                  {editorSpotlight.short_description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-base font-black bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-2xl shadow-xl" asChild>
                  <Link href="/editor-spotlight">
                    Find Out More <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Popular Categories — 14 industries (alphabetical) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1 text-xs font-black uppercase tracking-widest">
              Explore Local Industries
            </Badge>
            <h2 className="text-4xl font-extrabold mb-3">Popular Categories</h2>
            <p className="text-muted-foreground font-medium mb-6">Discover businesses spanning a wide array of local services</p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={`/find-a-service?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all"
                >
                  <div className={`p-3 rounded-xl shrink-0 ${cat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-foreground leading-tight flex-1">{cat.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Businesses - Premium Cinematic Cards */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-5xl font-extrabold tracking-tight mb-2">Featured Excellence</h2>
            <p className="text-muted-foreground text-lg italic">The crown jewels of the Bushbuckridge business community.</p>
          </div>
          <Button variant="ghost" size="lg" className="hover:bg-primary/5 font-bold" asChild>
            <Link href="/find-a-service">Browse Services &rarr;</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredList.map((biz) => {
            const logoUrl = biz.logo 
              ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${biz.collectionId}/${biz.id}/${biz.logo}`
              : 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop';
              
            return (
              <Card key={biz.id} className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2rem]">
                <div className="relative h-64 bg-muted overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${logoUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <Badge className="absolute top-6 left-6 bg-secondary text-secondary-foreground font-bold px-4 py-1 rounded-full shadow-lg">
                    {biz.expand?.sector?.name || 'Local Business'}
                  </Badge>
                </div>
                <CardHeader className="pb-4 relative -mt-12 bg-transparent">
                  <div className="bg-card p-6 rounded-[1.5rem] shadow-lg border border-border/50">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{biz.name}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shrink-0 font-bold border-0">
                        <Star className="h-4 w-4 mr-1 fill-current" /> 5.0
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {biz.expand?.area?.name || 'Bushbuckridge'}
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="px-6 pb-8 pt-0 flex gap-3">
                  {biz.whatsapp && (
                    <Button className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-600/20" asChild>
                      <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                        Quick WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 h-12 rounded-xl border-primary/20 hover:bg-primary/5 font-bold" asChild>
                    <Link href={`/business/${biz.slug}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Spotlight Articles Section */}
      {spotlightArticles.length > 0 && (
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <Badge className="mb-4 bg-secondary/10 text-secondary border-0 font-black text-xs px-4 py-1.5 uppercase tracking-widest">
                  <Newspaper className="h-3 w-3 mr-2" /> Community Features
                </Badge>
                <h2 className="text-5xl font-extrabold tracking-tight mb-2">Spotlight Articles</h2>
                <p className="text-muted-foreground text-lg italic">In-depth features on our premium business partners.</p>
              </div>
              <Button variant="ghost" size="lg" className="hover:bg-primary/5 font-bold" asChild>
                <Link href="/articles">View All Articles &rarr;</Link>
              </Button>
            </div>

            {/* Hero: Latest Article */}
            {(() => {
              const hero = spotlightArticles[0]
              const heroBiz = hero.expand?.business_id
              const heroImages = Array.isArray(hero.images) ? hero.images : (typeof hero.images === 'string' && hero.images ? [hero.images] : [])
              const heroThumb = heroImages.length > 0
                ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${hero.collectionId}/${hero.id}/${heroImages[0]}`
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
              const heroPreview = (hero.content || '').replace(/<[^>]*>/g, '').substring(0, 200)

              return (
                <Link href={`/articles/${hero.id}`} className="group block mb-10">
                  <div className="relative h-80 md:h-[28rem] rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroThumb} alt={heroBiz?.name || 'Spotlight'} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <Badge className="bg-secondary text-secondary-foreground font-black text-xs px-4 py-1.5 mb-4 shadow-lg">LATEST SPOTLIGHT</Badge>
                      <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 line-clamp-2">{heroBiz?.name || 'Featured Business'}</h3>
                      <p className="text-white/70 font-medium text-base md:text-lg line-clamp-2 max-w-2xl">{heroPreview || 'Read the full feature...'}</p>
                    </div>
                  </div>
                </Link>
              )
            })()}

            {/* Thumbnail Grid: Remaining Articles */}
            {spotlightArticles.length > 1 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {spotlightArticles.slice(1, 7).map((article) => {
                  const biz = article.expand?.business_id
                  const imgs = Array.isArray(article.images) ? article.images : (typeof article.images === 'string' && article.images ? [article.images] : [])
                  const thumb = imgs.length > 0
                    ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${article.collectionId}/${article.id}/${imgs[0]}`
                    : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'
                  const preview = (article.content || '').replace(/<[^>]*>/g, '').substring(0, 100)

                  return (
                    <Link key={article.id} href={`/articles/${article.id}`} className="group">
                      <div className="bg-card rounded-[2rem] shadow-xl overflow-hidden border border-border/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                        <div className="relative h-44 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={biz?.name || 'Spotlight'} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-secondary/90 text-secondary-foreground font-black text-[10px] px-3 py-1 shadow-lg">SPOTLIGHT</Badge>
                        </div>
                        <div className="p-5">
                          <h4 className="font-black text-lg text-primary mb-2 line-clamp-1">{biz?.name || 'Featured'}</h4>
                          <p className="text-muted-foreground text-sm font-medium line-clamp-2 mb-3">{preview || 'Read the feature...'}</p>
                          <span className="text-primary font-black text-sm flex items-center">Read More <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Premium CTA Banner (replaces Journal) */}
      <section className="container mx-auto px-4">
        <div className="bg-[#1B4332] text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Ready to Grow <br /><span className="text-secondary">Your Business?</span></h2>
            <p className="text-white/70 mb-10 text-xl font-medium max-w-lg">
              List your business in the Bushbuckridge Community Directory and connect with customers across the region. Self-service portal included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-16 px-10 text-lg font-extrabold bg-secondary text-white hover:bg-secondary/90 rounded-2xl shadow-xl transition-transform hover:scale-105" asChild>
                <Link href="/list-your-business"><Zap className="mr-3 h-6 w-6" /> Get Listed Today</Link>
              </Button>
              <Button size="lg" className="h-16 px-10 text-lg font-bold bg-white text-[#1B4332] hover:bg-white/90 rounded-2xl shadow-xl" asChild>
                <Link href="/list-your-business">View Packages <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative z-10 hidden md:flex items-center justify-center">
            <div className="w-64 h-80 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110 group cursor-pointer">
              <div className="w-16 h-1 bg-secondary/80 rounded-full mb-6" />
              <span className="text-2xl font-black text-center px-6 leading-relaxed">DOING BUSINESS IN <br /><span className="text-secondary">BUSHBUCKRIDGE</span> <br /><span className="text-sm font-medium text-white/40 tracking-widest uppercase mt-4 block">2026 / 2027</span></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
