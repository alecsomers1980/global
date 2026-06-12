import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { LockKeyhole, Sparkles, Zap, ShieldCheck } from 'lucide-react'

export default async function ClientSettingsPage() {
    const pb = await createClient()
    const user = pb.authStore.model

    if (!user) redirect('/login')

    let business: any = null
    try {
        business = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`)
    } catch (e) {
        redirect('/')
    }

    const tier = business.package_tier || 'basic'
    const isEnhanced = tier === 'pro-lead' || tier === 'pro-business'
    const isPremium = tier === 'pro-business'

    return (
        <div className="space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Profile Editor</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage features and visibility settings for your business.</p>
            </div>

            {/* STANDARD FEATURES (Available to All) */}
            <Card className="border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-primary/5">
                    <CardTitle className="text-2xl font-black flex items-center gap-2 border-primary">Core Business Info</CardTitle>
                    <CardDescription className="text-base font-medium">Standard listing foundation details.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Business Name</Label>
                            <Input defaultValue={business.name} disabled className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Physical Address / Area</Label>
                            <Input defaultValue="Bushbuckridge Central" disabled className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Contact Phone</Label>
                            <Input defaultValue={business.phone} disabled className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Contact Email</Label>
                            <Input defaultValue={business.email} disabled className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Business Description</Label>
                            <Textarea defaultValue={business.description?.split('**Package')[0].trim()} disabled className="min-h-[100px] bg-muted/50 font-bold border-0 resize-none p-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ENHANCED FEATURES */}
            <Card className={`border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden relative ${!isEnhanced ? 'border-amber-500 border-2' : ''}`}>
                {!isEnhanced && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2rem]">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm border border-amber-100">
                            <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                                <Zap className="h-8 w-8 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Enhanced Features</h3>
                            <p className="text-muted-foreground font-medium mb-6">Unlock rich media, social links, and website integration.</p>
                            <Button asChild className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg rounded-xl shadow-lg shadow-amber-500/20">
                                <Link href="/portal/billing"><LockKeyhole className="h-5 w-5 mr-2" /> Upgrade to Enhanced</Link>
                            </Button>
                        </div>
                    </div>
                )}
                
                <CardHeader className="p-8 border-b border-primary/5 bg-amber-50/50">
                    <CardTitle className="text-2xl font-black flex items-center gap-2 text-amber-700">Brand Identity & Direct Links</CardTitle>
                    <CardDescription className="text-base font-medium text-amber-900/60">Upload logos and connect your social platforms.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="flex gap-8 items-center border-b border-muted pb-8">
                        <div className="h-32 w-32 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden relative group">
                            {business.logo ? (
                                <img src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${business.collectionId}/${business.id}/${business.logo}`} className="h-full w-full object-cover" alt="Logo" />
                            ) : (
                                <span className="text-[10px] font-black text-primary/40 uppercase text-center p-2">No Logo<br/>Uploaded</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Business Logo</Label>
                            <Input type="file" disabled={!isEnhanced} className="h-12 pt-3 font-bold bg-muted/50 border-0" />
                            <p className="text-xs text-muted-foreground font-medium">Upload a square image (PNG or JPG) representing your brand.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Official Website</Label>
                            <Input defaultValue={business.website} disabled={!isEnhanced} placeholder="https://" className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">WhatsApp Direct Link</Label>
                            <Input defaultValue={business.whatsapp} disabled={!isEnhanced} placeholder="e.g. 27821234567" className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Facebook Page</Label>
                            <Input defaultValue={business.facebook} disabled={!isEnhanced} placeholder="https://facebook.com/..." className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Instagram Profile</Label>
                            <Input defaultValue={business.instagram} disabled={!isEnhanced} placeholder="https://instagram.com/..." className="h-12 bg-muted/50 font-bold border-0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* PREMIUM FEATURES */}
            <Card className={`border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden relative ${!isPremium ? 'border-rose-300 border-2' : ''}`}>
                {!isPremium && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2rem]">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm border border-rose-100">
                            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="h-8 w-8 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Premium Features</h3>
                            <p className="text-muted-foreground font-medium mb-6">Get featured placement, image galleries, and a full spotlight article.</p>
                            <Button asChild className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-xl shadow-lg shadow-rose-500/20">
                                <Link href="/portal/billing"><LockKeyhole className="h-5 w-5 mr-2" /> Upgrade to Premium</Link>
                            </Button>
                        </div>
                    </div>
                )}
                
                <CardHeader className="p-8 border-b border-primary/5 bg-rose-50/50">
                    <CardTitle className="text-2xl font-black flex items-center gap-2 text-rose-700">Spotlight & Advanced Lead Gen</CardTitle>
                    <CardDescription className="text-base font-medium text-rose-900/60">Maximum exposure tools mapped exclusively to top-tier partners.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="bg-white border rounded-[2rem] p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                        <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-10 w-10 text-rose-600" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-foreground mb-1">Spotlight Article Managed</h4>
                            <p className="text-muted-foreground font-medium">As a premium partner, your spotlight article is professionally drafted and managed by the Directory admin team to ensure highest SEO performance.</p>
                            <Button variant="outline" className="mt-4 font-bold border-primary/20 text-primary hover:bg-primary hover:text-white" disabled={!isPremium}>Contact Admin to Update Article</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">Image Gallery Upload (Max 10)</Label>
                            <Input type="file" multiple accept="image/*" disabled={!isPremium} className="h-12 pt-3 font-bold bg-muted/50 border-0" />
                            <p className="text-xs text-muted-foreground font-medium">Upload up to 10 high-resolution images of your products, team, or premises.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button disabled className="h-14 px-10 rounded-2xl font-black text-lg bg-primary text-white">Save Profile Changes</Button>
            </div>
            <p className="text-center text-sm font-bold text-muted-foreground italic">Note: Core business details must currently be authorized by support.</p>
        </div>
    )
}
