import SecondaryHeader from '@/components/SecondaryHeader'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
    const packages = [
        {
            name: 'Standard',
            price: 'Free',
            description: 'Essential presence for every local business.',
            icon: TrendingUp,
            color: 'text-slate-500',
            bgColor: 'bg-slate-50',
            features: [
                'Business Name & Category',
                'Basic Contact Details',
                'Physical Address',
                'Search Result Inclusion',
                'Standard Directory Listing'
            ],
            cta: 'Get Started',
            href: '/list-your-business?package=standard',
            featured: false
        },
        {
            name: 'Enhanced',
            price: 'R199',
            period: '/month',
            description: 'Stand out with rich media and social links.',
            icon: Zap,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
            features: [
                'Everything in Standard',
                'Business Logo and an image',
                'Social Media Integration',
                'Website & Email Links',
                'Verified Badge Status',
                'Priority Search Ranking'
            ],
            cta: 'Go Enhanced',
            href: '/list-your-business?package=enhanced',
            featured: true
        },
        {
            name: 'Premium',
            price: 'R499',
            period: '/month',
            description: 'Maximum exposure with full-page storytelling.',
            icon: Sparkles,
            color: 'text-rose-500',
            bgColor: 'bg-rose-50',
            features: [
                'Everything in Enhanced',
                'Business logo and gallery',
                'Full Spotlight Article',
                'Featured Home Page Placement',
                'Lead Management Dashboard',
                'Monthly Performance Report'
            ],
            cta: 'Go Premium',
            href: '/list-your-business?package=premium',
            featured: false
        }
    ]

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title="Transparent Pricing"
                subtitle="Choose the perfect plan to grow your business presence in the Bushbuckridge region."
                badge="PARTNERSHIP PLANS"
                backgroundImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg) => (
                        <Card key={pkg.name} className={`group border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] flex flex-col transition-all duration-500 hover:-translate-y-4 hover:shadow-primary/5 ${pkg.featured ? 'ring-2 ring-primary relative overflow-hidden' : ''}`}>
                            {pkg.featured && (
                                <div className="absolute top-0 right-0 p-10 pointer-events-none">
                                    <Badge className="bg-primary text-secondary font-black px-4 py-1.5 rounded-full shadow-lg">MOST POPULAR</Badge>
                                </div>
                            )}

                            <CardHeader className="p-10 pb-6">
                                <div className={`h-16 w-16 ${pkg.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <pkg.icon className={`h-8 w-8 ${pkg.color}`} />
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <CardTitle className="text-3xl font-black tracking-tight text-primary uppercase">{pkg.name}</CardTitle>
                                </div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-5xl font-black tracking-tighter text-foreground">{pkg.price}</span>
                                    {pkg.period && <span className="text-muted-foreground font-bold tracking-tight">{pkg.period}</span>}
                                </div>
                                <CardDescription className="text-base font-bold text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/10 pl-4">
                                    {pkg.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-10 flex-1">
                                <ul className="space-y-4">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex gap-4 font-bold text-muted-foreground/70 leading-snug">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-3.5 w-3.5 text-primary" strokeWidth={4} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="p-10 pt-6">
                                <Button className={`w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] gap-3 ${pkg.featured ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-secondary hover:bg-secondary/90 shadow-secondary/20'}`} asChild>
                                    <Link href={pkg.href}>
                                        {pkg.cta} <ArrowRight className="h-6 w-6" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-24 text-center max-w-2xl mx-auto space-y-6">
                    <h3 className="text-3xl font-black tracking-tight text-primary">Need a custom solution?</h3>
                    <p className="text-muted-foreground font-medium text-lg italic uppercase tracking-widest bg-primary/5 py-4 px-8 rounded-full border border-primary/5">
                        We offer tailored advertising and corporate partnership packages.
                    </p>
                    <Button variant="link" className="text-xl font-black text-primary hover:underline" asChild>
                        <a href="mailto:partnerships@bushbuckridge.com">Contact our sales team</a>
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ${className}`}>
            {children}
        </span>
    )
}
