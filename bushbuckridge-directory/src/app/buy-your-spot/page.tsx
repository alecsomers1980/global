import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { redirect } from 'next/navigation'
import SecondaryHeader from '@/components/SecondaryHeader'
import { Sparkles, Send, ShieldCheck } from 'lucide-react'

export default async function BuyYourSpotPage() {
    const pb = await createClient()
    
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
        const pb = await createClient()

        try {
            await pb.collection('enquiries').create({
                type: 'buy_spot',
                business_name: String(formData.get('businessName')),
                contact_person: String(formData.get('contactName')),
                phone: String(formData.get('phone')),
                email: String(formData.get('email')),
                details: `Package: ${formData.get('package')}\nNotes: ${formData.get('notes')}`,
                status: 'new',
            })
            redirect('/buy-your-spot/success')
        } catch (e) {
            console.error('Lead submission error:', e)
            redirect('/buy-your-spot?error=true')
        }
    }

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title="Reserve Your Spot"
                subtitle="Join the Bushbuckridge Business Directory to increase your local visibility and reach more customers."
                badge="GROW YOUR BUSINESS"
                backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-2">
                                <CardTitle className="text-3xl font-black tracking-tight text-primary">Business Details</CardTitle>
                                <CardDescription className="text-lg font-medium">All fields marked with an asterisk (*) are required.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-6">
                                <form action={submitLead} className="space-y-8">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="businessName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Business Name *</Label>
                                            <Input id="businessName" name="businessName" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="contactName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Contact Person *</Label>
                                            <Input id="contactName" name="contactName" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20" />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Phone / WhatsApp *</Label>
                                            <Input id="phone" name="phone" type="tel" required className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Email Address</Label>
                                            <Input id="email" name="email" type="email" className="h-14 rounded-2xl bg-white/50 border-primary/10 transition-all focus:ring-primary/20" />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="sector" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Primary Sector</Label>
                                            <Select name="sector">
                                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
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
                                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
                                                    <SelectValue placeholder="Select an area" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {areas?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="package" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Requested Package</Label>
                                        <Select name="package" defaultValue="standard">
                                            <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
                                                <SelectValue placeholder="Select a package" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="standard">Standard Listing (Free)</SelectItem>
                                                <SelectItem value="enhanced">Enhanced Listing</SelectItem>
                                                <SelectItem value="premium">Premium Showcase</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Additional Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            placeholder="Tell us a bit about your services..."
                                            className="resize-none rounded-[2rem] bg-white/50 border-primary/10 p-6 focus:ring-primary/20"
                                            rows={4}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-20 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]">
                                        Submit Request <Send className="ml-3 h-6 w-6" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-secondary/10 backdrop-blur-xl border border-secondary/20 p-10 rounded-[2.5rem] shadow-xl">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                                <Sparkles className="h-8 w-8 text-secondary" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-primary mb-4">Why List With Us?</h3>
                            <ul className="space-y-4">
                                {[
                                    'Reach over 10,000 monthly visitors',
                                    'Improve your local SEO visibility',
                                    'Connect with corporate partners',
                                    'Digital presence for your brand',
                                    'Premium business spotlight opportunities'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-secondary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-primary/5 border border-primary/5 p-10 rounded-[2.5rem]">
                            <h3 className="text-xl font-black tracking-tight text-primary mb-4 flex items-center">
                                <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> Verified Directory
                            </h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                Our directory is curated and verified to ensure high-quality listings for our users and genuine leads for our partners.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
