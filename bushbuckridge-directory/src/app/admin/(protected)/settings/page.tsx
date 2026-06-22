import { requireAdmin } from '@/utils/pocketbase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import PocketBase from 'pocketbase'
import { savePricing } from './actions'

async function getPriceSettings() {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    if (!pbUrl) return { price_basic: '199', price_pro_lead: '799', price_pro_business: '10500' }
    const pb = new PocketBase(pbUrl)
    try {
        const result = await pb.collection('settings').getList(1, 100)
        const items = result.items
        const find = (key: string) => { const r = items.find((s: any) => s.key === key); return r?.value || '' }
        return {
            price_basic: find('price_basic') || '199',
            price_pro_lead: find('price_pro_lead') || '799',
            price_pro_business: find('price_pro_business') || '10500',
        }
    } catch {
        return { price_basic: '199', price_pro_lead: '799', price_pro_business: '10500' }
    }
}

export default async function AdminSettingsPage() {
    const user = await requireAdmin()
    const priceSettings = await getPriceSettings()
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">System Settings</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage your account and platform configurations.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                        <CardTitle className="text-2xl font-black">Admin Profile</CardTitle>
                        <CardDescription className="text-base font-medium">Your current administrator account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2"><Label className="uppercase tracking-widest text-xs font-black text-primary/40">Email Address</Label><Input disabled value={user.email} className="h-14 rounded-xl bg-white shadow-sm font-bold opacity-70" /></div>
                        <div className="space-y-2"><Label className="uppercase tracking-widest text-xs font-black text-primary/40">Account ID</Label><Input disabled value={user.id} className="h-14 rounded-xl font-mono text-sm bg-muted/50 border-0" /></div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                        <CardTitle className="text-2xl font-black">Pricing Configuration</CardTitle>
                        <CardDescription className="text-base font-medium">Platform-wide subscription prices.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <form action={savePricing} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                    Basic (Annual)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">R</span>
                                    <Input name="price_basic" type="number" min="0" step="1" defaultValue={priceSettings.price_basic} className="pl-10 h-14 rounded-xl bg-white shadow-sm font-bold" placeholder="199" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                    Pro Lead (Annual)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">R</span>
                                    <Input name="price_pro_lead" type="number" min="0" step="1" defaultValue={priceSettings.price_pro_lead} className="pl-10 h-14 rounded-xl bg-white shadow-sm font-bold" placeholder="799" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                    Pro Business (Annual)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">R</span>
                                    <Input name="price_pro_business" type="number" min="0" step="1" defaultValue={priceSettings.price_pro_business} className="pl-10 h-14 rounded-xl bg-white shadow-sm font-bold" placeholder="10500" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl font-black text-lg">Save Pricing</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}