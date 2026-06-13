import { requireAdmin } from '@/utils/pocketbase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PocketBase from 'pocketbase'
import { saveYocoSettings, savePricing } from './actions'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

async function getYocoSettings() {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    if (!pbUrl) return { secret_key: '', public_key: '', webhook_secret: '' }
    const pb = new PocketBase(pbUrl)
    try {
        const result = await pb.collection('settings').getList(1, 100)
        const items = result.items
        const find = (key: string) => { const r = items.find((s: any) => s.key === key); return r?.value || '' }
        return { secret_key: find('yoco_secret_key'), public_key: find('yoco_public_key'), webhook_secret: find('yoco_webhook_secret') }
    } catch { return { secret_key: '', public_key: '', webhook_secret: '' } }
}

function maskValue(val: string): string { if (!val || val === 'not_set') return ''; if (val.length <= 8) return val; return val.slice(0, 4) + '••••••••' + val.slice(-4) }

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
    const settings = await getYocoSettings()
    const priceSettings = await getPriceSettings()
    const hasCredentials = settings.secret_key && settings.secret_key !== 'not_set'
    const envCredentials = !!process.env.YOCO_SECRET_KEY
    const isTestMode = (settings.secret_key || process.env.YOCO_SECRET_KEY || '').startsWith('sk_test_')
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

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] max-w-2xl">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                        Yoco Configuration
                        {hasCredentials ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full font-bold border-emerald-200/50"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Configured</Badge>
                        ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 rounded-full font-bold border-amber-200/50"><AlertTriangle className="w-3.5 h-3.5 mr-1" />Not configured</Badge>
                        )}
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                        {envCredentials
                            ? 'Credentials are loaded from environment variables (YOCO_SECRET_KEY). Field values are ignored.'
                            : 'Enter your Yoco API keys. These are stored in the PocketBase settings collection.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {isTestMode && hasCredentials && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-700 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Test mode active – using sandbox credentials
                        </div>
                    )}
                    <form action={saveYocoSettings} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Secret Key</Label>
                            <div className="relative">
                                <Input
                                    name="yoco_secret_key"
                                    type="text"
                                    defaultValue={envCredentials ? maskValue(settings.secret_key) : settings.secret_key === 'not_set' ? '' : settings.secret_key}
                                    disabled={envCredentials}
                                    placeholder={envCredentials ? 'Set via environment' : 'sk_test_...'}
                                    className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                                />
                                {envCredentials && settings.secret_key ? <span className="text-xs font-bold text-muted-foreground absolute -bottom-5 left-0">{maskValue(settings.secret_key)}</span> : null}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Public Key</Label>
                            <Input
                                name="yoco_public_key"
                                type="text"
                                defaultValue={settings.public_key === 'not_set' ? '' : settings.public_key}
                                disabled={envCredentials}
                                placeholder={envCredentials ? 'Set via environment' : 'pk_test_...'}
                                className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Webhook Secret</Label>
                            <Input
                                name="yoco_webhook_secret"
                                type="text"
                                defaultValue={settings.webhook_secret === 'not_set' ? '' : settings.webhook_secret}
                                disabled={envCredentials}
                                placeholder={envCredentials ? 'Set via environment' : 'whsec_...'}
                                className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                            />
                        </div>
                        {!envCredentials && (
                            <Button type="submit" className="w-full h-14 rounded-xl font-black text-lg">Save Yoco Settings</Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}