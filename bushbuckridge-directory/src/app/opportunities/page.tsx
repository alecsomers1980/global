import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, isPast } from 'date-fns'
import { Briefcase, AlertCircle, Download, Sparkles, TrendingUp, MapPin, Building2, ArrowRight } from 'lucide-react'
import SecondaryHeader from '@/components/SecondaryHeader'
import Link from 'next/link'

export default async function OpportunitiesPage() {
  const pb = await createClient()
  let opps: any[] = []
  let error = false
  try {
    const records = await pb.collection('opportunities').getList(1, 50, { sort: 'deadline' })
    opps = records.items
  } catch (e) {
    console.error('Failed to fetch opportunities', e)
    error = true
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Funding':
        return 'bg-emerald-500 text-white shadow-emerald-500/20'
      case 'Tenders':
        return 'bg-sky-500 text-white shadow-sky-500/20'
      case 'Training':
        return 'bg-violet-500 text-white shadow-violet-500/20'
      case 'Grants':
        return 'bg-amber-500 text-white shadow-amber-500/20'
      case 'Business Support':
        return 'bg-slate-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      <SecondaryHeader
        title="Business Opportunities"
        subtitle="Browse active tenders, funding applications, and business support programs available to enterprises in the region."
        badge="GROWTH & FUNDING"
        backgroundImage="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2000&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {error ? (
          <div className="p-8 text-sm text-red-500 bg-red-50 rounded-[2rem] border border-red-200 shadow-sm text-center">
            Failed to load opportunities. Please refresh the page.
          </div>
        ) : opps?.length === 0 ? (
          <div className="text-center py-32 bg-card/60 backdrop-blur-xl rounded-[3.5rem] border border-dashed flex flex-col items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <TrendingUp className="h-10 w-10 text-primary/20" />
            </div>
            <h3 className="text-2xl font-black text-primary">No active opportunities</h3>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium mt-2">
              We continually update this section as new tenders and funding programs become available.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {opps?.map((opp) => {
              const closingSoon =
                opp.deadline &&
                !isPast(new Date(opp.deadline)) &&
                new Date(opp.deadline).getTime() - new Date().getTime() <
                  3 * 24 * 60 * 60 * 1000
              const closed = opp.deadline && isPast(new Date(opp.deadline))

              return (
                <Card
                  key={opp.id}
                  className={`group flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2.5rem] ${
                    closed ? 'opacity-60 saturate-50' : ''
                  }`}
                >
                  <CardHeader className="p-8 pb-6">
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <Badge
                        className={`${getCategoryColor(
                          opp.category
                        )} font-black px-4 py-1.5 rounded-full border-0 shadow-lg`}
                      >
                        {opp.category}
                      </Badge>
                      <div className="flex flex-col items-end">
                        {closingSoon && (
                          <Badge className="bg-amber-500 text-white font-black animate-pulse rounded-full px-3">
                            <AlertCircle className="h-3 w-3 mr-1" /> Closing Soon
                          </Badge>
                        )}
                        {closed && (
                          <Badge className="bg-red-500 text-white font-black rounded-full px-3">
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/opportunities/${opp.id}`} className="hover:text-primary transition-colors">
                        {opp.title}
                      </Link>
                    </CardTitle>
                    {opp.organization && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Building2 className="h-4 w-4" />
                        {opp.organization}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                      {opp.value && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> Value: {opp.value}
                        </span>
                      )}
                      {opp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {opp.location}
                        </span>
                      )}
                    </div>
                    {opp.deadline && (
                      <div className="flex items-center gap-2 mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <AlertCircle
                            className={`h-4 w-4 ${
                              closed ? 'text-red-500' : 'text-primary'
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                            Deadline
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              closed ? 'text-red-500 line-through' : 'text-foreground'
                            }`}
                          >
                            {format(new Date(opp.deadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex-1">
                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-3">
                      {opp.description ? opp.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&') : (opp.contact_info || '')}
                    </p>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 gap-4 flex-col">
                    {opp.attachment && (
                      <Button
                        variant="outline"
                        className="h-14 w-full rounded-2xl font-black border-primary/10 shadow-sm"
                        disabled={closed}
                        asChild
                      >
                        <a
                          href={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${opp.collectionId}/${opp.id}/${opp.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" /> Doc
                        </a>
                      </Button>
                    )}
                    <Button
                      className="h-14 w-full bg-primary hover:bg-primary/90 rounded-2xl font-black shadow-lg shadow-primary/10 transition-all active:scale-95"
                      asChild
                    >
                      <Link href={`/opportunities/${opp.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
