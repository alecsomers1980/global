import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SecondaryHeader from '@/components/SecondaryHeader'
import { Sparkles, ShieldCheck, ArrowRight, Check, TrendingUp, Zap, Star } from 'lucide-react'

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
            'Business name & description',
            'Physical address & contact details',
            'Business logo',
            'Business hours',
            'Services list',
            'Customer enquiries',
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
            'Everything in Basic',
            'Cover / banner image',
            'Photo gallery (up to 3)',
            'WhatsApp link',
            'Social media links',
            'Customer reviews & star ratings',
            'Quote / enquiry button',
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
            'Everything in Pro Lead',
            'Photo gallery (up to 10)',
            'Website link',
            'Video showcase',
            'FAQ section',
            'Certifications & accreditations',
            'Special offers & promotions',
            'Location map & business stats',
            'Monthly performance email',
            '4 quarterly news updates during the year',
            'CSI publications across 4 additional media platforms',
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

export default function ListYourBusinessPage() {
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
                                    <Button className={`w-full h-14 text-base font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] gap-3 ${pkg.featured ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' : 'bg-secondary text-primary hover:bg-secondary/90 shadow-secondary/20'}`} asChild>
                                        <a href={`/buy-your-spot?tier=${pkg.key}`}>
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

            {/* CTA to wizard */}
            <div className="container max-w-4xl mx-auto px-4 text-center">
                <p className="text-muted-foreground font-medium mb-6">Ready to get listed? Select a package above to get started — you'll create your account and pay in just a few steps.</p>
                <a href="/buy-your-spot" className="inline-flex items-center gap-3 h-16 px-10 text-lg font-black bg-primary text-white rounded-2xl shadow-xl hover:bg-primary/90 transition-all">
                    Get Started <ArrowRight className="h-5 w-5" />
                </a>
            </div>
        </div>
    )
}
