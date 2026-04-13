import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format, subDays } from 'date-fns'
import { Eye, Globe, MessageCircle, Phone, LockKeyhole } from 'lucide-react'

export default async function ClientPortalPage() {
    const pb = await createClient()
    const user = pb.authStore.model

    if (!user) redirect('/login')

    let business: any = null
    try {
        business = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`, {
            expand: 'subscriptions',
        })
    } catch (e) {
        redirect('/')
    }

    const isPremium = business.package_tier === 'premium'
    const isEnhanced = business.package_tier === 'enhanced'
    const hasAnalyticsAccess = isPremium || isEnhanced

    // Fetch Analytics if allowed
    let stats = { views: 0, website: 0, whatsapp: 0, phone: 0 }

    if (hasAnalyticsAccess) {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString().replace('T', ' ')

        try {
            const events = await pb.collection('analytics_events').getFullList({
                filter: `business = "${business.id}" && created >= "${thirtyDaysAgo}"`,
            })

            events.forEach(e => {
                if (e.event_type === 'profile_view') stats.views++
                if (e.event_type === 'website_click') stats.website++
                if (e.event_type === 'whatsapp_click') stats.whatsapp++
                if (e.event_type === 'phone_click') stats.phone++
            })
        } catch (e) {
            console.error('Failed to fetch analytics', e)
        }
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Analytics Overview</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Performance metrics for the last 30 days.</p>
            </div>

            {!hasAnalyticsAccess ? (
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden text-center p-12 relative">
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    <LockKeyhole className="h-16 w-16 text-primary/30 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-primary mb-4">Premium Feature</h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 font-medium">
                        Detailed analytics tracking is exclusively available to Enhanced and Premium tier businesses.
                    </p>
                    <a href="mailto:sales@rimintsu.co.za?subject=Upgrade to Premium Analytics" className="inline-flex h-14 items-center justify-center rounded-2xl bg-secondary px-8 text-lg font-bold text-secondary-foreground shadow-lg hover:bg-secondary/90 transition-colors">
                        Upgrade Your Plan
                    </a>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Profile Views
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="text-5xl font-black text-primary group-hover:text-secondary transition-colors">{stats.views}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" /> WhatsApp Clicks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="text-5xl font-black text-[#25D366] group-hover:text-[#1ea855] transition-colors">{stats.whatsapp}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Phone Calls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="text-5xl font-black text-primary group-hover:text-secondary transition-colors">{stats.phone}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Website Visits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="text-5xl font-black text-primary group-hover:text-secondary transition-colors">{stats.website}</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
