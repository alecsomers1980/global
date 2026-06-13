import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { redirect } from 'next/navigation'
import SecondaryHeader from '@/components/SecondaryHeader'
import { Sparkles, Send, ShieldCheck, ArrowRight, Check, TrendingUp, Zap, Star } from 'lucide-react'

const PACKAGES = [
    {
        key: 'basic',
        name: 'Basic Listing',
        price: 'R199',
        period: 'per annum (excl. VAT)',
        description: 'A simple and affordable entry-level listing for businesses that want to be visible in the directory.',
        icon: TrendingUp,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        features: [
            'Business name',
            'Business description',
            'Business address',
            'Contact details',
            'Business logo',
        ],
        featured: false,
    },
    {
        key: 'pro-lead',
        name: 'Pro Lead Package',
        price: 'R799',
        period: 'per annum (excl. VAT)',
        description: 'Ideal for businesses that want a more professional and interactive presence on the live website.',
        icon: Zap,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        features: [
            'Business name',
            'Business description',
            'Business address',
            'Contact details',
            'Company logo',
            '3 Photos',
            'WhatsApp link',
            'Links to Social Media pages',
        ],
        featured: true,
    },
    {
        key: 'pro-business',
        name: 'Pro Business Listing',
        price: 'R10 500',
        period: 'per annum (excl. VAT)',
        description: 'A premium visibility package for established businesses, organisations and brands that want ongoing exposure and stronger storytelling opportunities.',
        icon: Star,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        features: [
            'Business name',
            'Business description',
            'Business logo',
            'Photo Gallery (10 Max)',
            'Full business profile',
            'Website link',
            'WhatsApp link',
            'Links to Social Media pages',
            '4 quarterly news updates published during the year',
            'CSI initiative publications across 4 additional media platforms',
        ],
        featured: false,
    },
]

const WHY_LIST = [
    'Increase your business visibility in Bushbuckridge',
    'Give customers easy access to your contact details',
    'Strengthen credibility through a professional directory presence',
    'Benefit from media-backed exposure for your business and community initiatives',
    'Position your brand where local audiences can find and engage with it',
]

const NOTES = [
    'All packages are billed annually.',
    'Content supplied by clients may be edited for style, clarity and publication standards.',
    'Quarterly updates and CSI publications will be scheduled in line with the publication calendar.',
    'Prices exclude VAT, where applicable.',
]

export default async function ListYourBusinessPage({
    searchParams,
}: {
    searchParams: Promise<{ package?: string }>
}) {
    const pb = await createClient()
    const resolvedParams = await searchParams

    let sectors: any[] = []
    let areas: any[] = []
    try {
        sectors = await pb.collection('sectors').getFullList({ sort: 'name' })
        areas = await pb.collection('areas').getFullList({ sort: 'name' })
    } catch (e) {
        console.error('Failed to fetch taxonomies', e)
    }

    async function submitLead(formData: FormData) {
        'use server'
        const businessName = String(formData.get('businessName') || '')
        const contactName = String(formData.get('contactName') || '')
        const phone = String(formData.get('phone') || '')
        const email = String(formData.get('email') || '')
        const packageTier = String(formData.get('package') || '')
        const notes = String(formData.get('notes') || '')

        let ok = false
        try {
          const pb = await createClient()
          await pb.collection('enquiries').create({
            type: 'buy_spot',
            business_name: businessName,
            contact_person: contactName,
            phone,
            email,
            details: `Package: ${packageTier}\nNotes: ${notes}`,
            status: 'new',
          })

          const { sendEnquiryNotification, sendEnquiryConfirmation } = await import('@/lib/email')
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dbib.co.za'
          await sendEnquiryNotification({
            type: 'Listing Enquiry',
            businessName,
            contactPerson: contactName,
            email,
            phone,
            details: `Package: ${packageTier}\nNotes: ${notes}`,
          }).catch((e) => console.error('Admin notification failed:', e))
          if (email) {
            await sendEnquiryConfirmation({
              to: email,
              contactPerson: contactName,
              businessName,
              siteUrl,
            }).catch((e) => console.error('Confirmation email failed:', e))
          }
          ok = true
        } catch (e) {
          console.error('Lead submission error:', e)
        }
        redirect(ok ? '/list-your-business/success' : '/list-your-business?error=true')
    }

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title="List Your Business"
                subtitle="Grow your visibility. Build trust. Reach local customers through the Doing Business in Bushbuckridge (DBiB) directory."
                badge="DIRECTORY LISTING RATE CARD"
                backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
            />

            {/* Intro Copy */}
            <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-20 mb-16 text-center">
                <div className="bg-card/80 backdrop-blur-xl border rounded-[2rem] p-10 shadow-xl">
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
                        The Doing Business in Bushbuckridge (DBiB) directory is designed to give businesses a strong presence through a credible local platform that connects enterprises with communities, consumers, partners and institutions.
                    </p>
                </div>
            </div>

            {/* Pricing Packages */}
            <div className="container mx-auto px-4 mb-24 relative z-10">
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 px-4 py-1 text-xs font-black uppercase tracking-widest">
                        Choose Your Package
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">Directory Listing Rate Card</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {PACKAGES.map((pkg) => {
                        const Icon = pkg.icon
                        return (
                            <Card key={pkg.key} className={`group border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] flex flex-col transition-all duration-500 hover:-translate-y-4 hover:shadow-primary/10 ${pkg.featured ? 'ring-2 ring-primary relative overflow-hidden' : ''}`}>
                                {pkg.featured && (
                                    <div className="absolute top-0 right-0 p-8 pointer-events-none">
                                        <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full shadow-lg">MOST POPULAR</Badge>
                                    </div>
                                )}

                                <CardHeader className="p-10 pb-6">
                                    <div className={`h-16 w-16 ${pkg.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-8 w-8 ${pkg.color}`} />
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tight text-primary uppercase mb-2">{pkg.name}</CardTitle>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-4xl font-black tracking-tighter text-foreground">{pkg.price}</span>
                                        <span className="text-muted-foreground font-bold tracking-tight text-sm">{pkg.period}</span>
                                    </div>
                                    <CardDescription className="text-base font-medium text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/10 pl-4">
                                        {pkg.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-10 flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-4">Includes:</p>
                                    <ul className="space-y-3">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex gap-3 font-medium text-foreground/80 leading-snug text-sm">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="p-10 pt-6">
                                    <Button className={`w-full h-14 text-base font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] gap-3 ${pkg.featured ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-secondary hover:bg-secondary/90 shadow-secondary/20'}`} asChild>
                                        <a href={`#apply-form`}>
                                            Select {pkg.name} <ArrowRight className="h-5 w-5" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Why List + Notes */}
            <div className="container max-w-6xl mx-auto px-4 mb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-secondary/10 backdrop-blur-xl border border-secondary/20 p-10 rounded-[2.5rem] shadow-xl">
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                            <Sparkles className="h-8 w-8 text-secondary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-primary mb-6">Why List with DBiB?</h3>
                        <ul className="space-y-5">
                            {WHY_LIST.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 font-bold text-muted-foreground/80 leading-snug">
                                    <div className="h-2.5 w-2.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] backdrop-blur-sm">
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-primary mb-6">Notes</h3>
                        <ul className="space-y-4">
                            {NOTES.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 font-medium text-muted-foreground/80 leading-snug text-sm italic">
                                    <div className="h-2 w-2 rounded-full bg-primary/40 mt-2 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Application Form */}
            <div id="apply-form" className="container max-w-4xl mx-auto px-4">
                <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-2">
                        <CardTitle className="text-3xl font-black tracking-tight text-primary">Onboarding Form</CardTitle>
                        <CardDescription className="text-lg font-medium tracking-tight">Tell us about your business and we'll handle the rest.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-6">
                        <form action={submitLead} className="space-y-8">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="businessName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Business Name *</Label>
                                    <Input id="businessName" name="businessName" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20 font-medium" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="contactName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Contact Person *</Label>
                                    <Input id="contactName" name="contactName" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20 font-medium" />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Phone / WhatsApp *</Label>
                                    <Input id="phone" name="phone" type="tel" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20 font-medium" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Email Address</Label>
                                    <Input id="email" name="email" type="email" className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20 font-medium" />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="sector" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Primary Sector</Label>
                                    <Select name="sector">
                                        <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10 font-medium">
                                            <SelectValue placeholder="Select a sector" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {sectors?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="area" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Location / Area</Label>
                                    <Select name="area">
                                        <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10 font-medium">
                                            <SelectValue placeholder="Select an area" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {areas?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="package" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Requested Package *</Label>
                                <Select name="package" defaultValue={resolvedParams.package || 'pro-lead'}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10 font-medium">
                                        <SelectValue placeholder="Select a package" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="basic" className="rounded-lg">Basic Listing — R199 / annum (excl. VAT)</SelectItem>
                                        <SelectItem value="pro-lead" className="rounded-lg">Pro Lead Package — R799 / annum (excl. VAT)</SelectItem>
                                        <SelectItem value="pro-business" className="rounded-lg">Pro Business Listing — R10 500 / annum (excl. VAT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Tell us a bit about your services..."
                                    className="resize-none rounded-[2rem] bg-white/50 border-primary/10 p-6 focus:ring-primary/20 font-medium min-h-[150px]"
                                    rows={4}
                                />
                            </div>

                            <Button type="submit" className="w-full h-20 text-2xl font-black rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] gap-4">
                                Submit Listing <Send className="h-7 w-7" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
