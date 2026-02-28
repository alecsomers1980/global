import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Briefcase, Calendar, Star, BookOpen, Layers } from 'lucide-react'

// Mock Data
const quickTiles = [
  { name: 'Directory', icon: Layers, href: '/directory', color: 'bg-blue-100 text-blue-600' },
  { name: 'Find a Service', icon: Search, href: '/find-a-service', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Opportunities', icon: Briefcase, href: '/opportunities', color: 'bg-purple-100 text-purple-600' },
  { name: 'Jobs', icon: MapPin, href: '/jobs', color: 'bg-orange-100 text-orange-600' },
  { name: 'Events', icon: Calendar, href: '/events', color: 'bg-rose-100 text-rose-600' },
  { name: 'Spotlight', icon: Star, href: '/spotlight', color: 'bg-yellow-100 text-yellow-600' },
]

const featuredBusinesses = [
  { id: 1, name: 'Bushbuckridge Builders', category: 'Construction', area: 'Thulamahashe', rating: 4.8 },
  { id: 2, name: 'Savannah Tech Solutions', category: 'IT Services', area: 'Acornhoek', rating: 5.0 },
  { id: 3, name: 'Local Flavors Catering', category: 'Food & Dining', area: 'Dwarsloop', rating: 4.9 },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: `url('/hero.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-md px-6 py-1.5 text-sm font-medium tracking-wide uppercase">
            Empowering the Bushbuckridge Economy
          </Badge>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-tight text-white max-w-5xl mx-auto mb-8 leading-[0.9]">
            The Digital Heart of <span className="text-secondary italic">Bushbuckridge</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 font-medium">
            Discover trusted local services, premium business opportunities, and the thriving commercial landscape of the Lowveld.
          </p>

          <div className="max-w-3xl mx-auto glass p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-3">
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

          <div className="mt-12 flex items-center justify-center gap-6">
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white/10 backdrop-blur-md rounded-xl" asChild>
              <Link href="/find-a-service">Explore Directory</Link>
            </Button>
            <Button variant="link" asChild className="text-white hover:text-secondary font-semibold text-lg">
              <Link href="/buy-your-spot">List your business &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Tiles - Cinematic Refactor */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {quickTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.name}
                href={tile.href}
                className="group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border bg-card/80 backdrop-blur-xl text-card-foreground shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50"
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

      {/* Featured Businesses - Premium Cinematic Cards */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-5xl font-extrabold tracking-tight mb-2">Featured Excellence</h2>
            <p className="text-muted-foreground text-lg italic">The crown jewels of the Bushbuckridge business community.</p>
          </div>
          <Button variant="ghost" size="lg" className="hover:bg-primary/5 font-bold" asChild>
            <Link href="/directory">View Full Directory &rarr;</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredBusinesses.map((biz) => (
            <Card key={biz.id} className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2rem]">
              <div className="relative h-64 bg-muted overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop')` }} // Generic premium placeholder
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <Badge className="absolute top-6 left-6 bg-secondary text-secondary-foreground font-bold px-4 py-1 rounded-full shadow-lg">
                  {biz.category}
                </Badge>
              </div>
              <CardHeader className="pb-4 relative -mt-12 bg-transparent">
                <div className="bg-card p-6 rounded-[1.5rem] shadow-lg border border-border/50">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{biz.name}</CardTitle>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shrink-0 font-bold border-0">
                      <Star className="h-4 w-4 mr-1 fill-current" /> {biz.rating}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {biz.area}
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="px-6 pb-8 pt-0 flex gap-3">
                <Button className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-600/20">
                  Quick WhatsApp
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-primary/20 hover:bg-primary/5 font-bold">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Download Journal Banner - Cinematic Refactor */}
      <section className="container mx-auto px-4">
        <div className="bg-[#1B4332] text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <Badge className="mb-6 bg-secondary text-secondary-foreground font-bold px-4 py-1 shadow-lg">Premium Publication</Badge>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">The 2026 Annual <br /><span className="text-secondary">Business Journal</span></h2>
            <p className="text-white/70 mb-10 text-xl font-medium max-w-lg">
              Unlock the full potential of the Bushbuckridge region with our comprehensive market analysis and business registry.
            </p>
            <Button size="lg" className="h-16 px-10 text-lg font-extrabold bg-white text-primary hover:bg-white/90 rounded-2xl shadow-xl transition-transform hover:scale-105" asChild>
              <Link href="/download-journal"><BookOpen className="mr-3 h-6 w-6" /> Download PDF Edition</Link>
            </Button>
          </div>
          <div className="relative z-10 hidden md:flex items-center justify-center">
            <div className="w-64 h-80 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110 group cursor-pointer">
              <div className="w-16 h-1 w-white bg-secondary/80 rounded-full mb-6" />
              <span className="text-2xl font-black text-center px-6 leading-tight leading-relaxed">BUSHBUCKRIDGE <br /><span className="text-secondary">JOURNAL</span> <br /><span className="text-sm font-medium text-white/40 tracking-widest uppercase mt-4 block">2026 Edition</span></span>
              <Button size="icon" className="absolute bottom-6 right-6 bg-secondary text-secondary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <BookOpen className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
