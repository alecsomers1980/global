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
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-muted/30 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-background px-4 py-1 text-sm">
            Empowering the Local Economy
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto mb-6">
            Doing Business in <span className="text-primary">Bushbuckridge</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Find trusted local services, discover business opportunities, and connect with the thriving commercial hub of Bushbuckridge.
          </p>

          <div className="max-w-2xl mx-auto bg-background p-2 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="What service are you looking for?"
                className="pl-10 border-0 focus-visible:ring-0 shadow-none h-12 text-base"
              />
            </div>
            <Button size="lg" className="h-12 px-8">Search</Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/find-a-service">Browse all services</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground">
              <Link href="/buy-your-spot">List your business &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Tiles */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link key={tile.name} href={tile.href} className="group flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className={`p-4 rounded-xl ${tile.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-sm text-center">{tile.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Businesses</h2>
          <Button variant="ghost" asChild>
            <Link href="/directory">View all &rarr;</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBusinesses.map((biz) => (
            <Card key={biz.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="h-32 bg-muted flex items-center justify-center text-muted-foreground">
                [ Business Cover ]
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="line-clamp-1">{biz.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0"><Star className="h-3 w-3 mr-1 fill-current" /> {biz.rating}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" /> {biz.area}
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{biz.category}</Badge>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button className="w-full flex-1 bg-green-600 hover:bg-green-700">WhatsApp</Button>
                <Button variant="outline" className="flex-1">View Profile</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Download Journal Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Annual Business Journal</h2>
            <p className="text-primary-foreground/80 mb-6 text-lg">
              Get comprehensive insights, contact lists, and market analysis for the Bushbuckridge region in our latest PDF edition.
            </p>
            <Button size="lg" variant="secondary" className="font-semibold" asChild>
              <Link href="/download-journal"><BookOpen className="mr-2 h-5 w-5" /> Download 2026 Edition</Link>
            </Button>
          </div>
          <div className="relative z-10 hidden md:block w-48 h-64 bg-white/10 rounded-lg border border-white/20 shadow-xl flex items-center justify-center -rotate-6 transition-transform hover:rotate-0">
            <span className="text-xl font-bold text-center">BUSHBUCKRIDGE <br /> JOURNAL</span>
          </div>
        </div>
      </section>
    </div>
  )
}
