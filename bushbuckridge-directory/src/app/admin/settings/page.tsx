import { requireAdmin } from '@/utils/pocketbase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PocketBase from 'pocketbase'
import { saveYocoSettings } from './actions'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

async function getYocoSettings() {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    if (!pbUrl) return { secret_key: '', public_key: '', webhook_secret: '' }

    const pb = new PocketBase(pbUrl)
    try {
        const result = await pb.collection('settings').getList(1, 100)
        const items = result.items
        const find = (key: string) => {
            const r = items.find((s: any) => s.key === key)
            return r?.value || ''
        }
        return {
            secret_key: find('yoco_secret_key'),
            public_key: find('yoco_public_key'),
            webhook_secret: find('yoco_webhook_secret'),
        }
    } catch {
        return { secret_key: '', public_key: '', webhook_secret: '' }
    }
}

function maskValue(val: string): string {
    if (!val || val === 'not_set') return ''
    if (val.length <= 8) return val
    return val.slice(0, 4) + '••••••••' + val.slice(-4)
}

export default async function AdminSettingsPage() {
    const user = await requireAdmin()
    const settings = await getYocoSettings()

    const hasCredentials =
        settings.secret_key &&
        settings.secret_key !== 'not_set'

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
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Email Address</Label>
                            <Input disabled value={user.email} className="h-14 rounded-xl bg-white shadow-sm font-bold opacity-70" />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Account ID</Label>
                            <Input disabled value={user.id} className="h-14 rounded-xl font-mono text-sm bg-muted/50 border-0" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                        <CardTitle className="text-2xl font-black">Pricing Configuration</CardTitle>
                        <CardDescription className="text-base font-medium">Platform-wide subscription prices.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 opacity-60">
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Enhanced Package (Monthly)</Label>
                            <Input disabled value="R499" className="h-14 rounded-xl bg-white shadow-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">Premium Package (Monthly)</Label>
                            <Input disabled value="R999" className="h-14 rounded-xl bg-white shadow-sm font-bold" />
                        </div>
                        <p className="text-xs font-bold text-amber-600 block mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                            Note: Pricing adjustments must currently be made via codebase.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] max-w-2xl">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black">Yoco Configuration</CardTitle>
                        <CardDescription className="text-base font-medium mt-1">
                            Payment gateway credentials for processing directory listing payments.
                        </CardDescription>
                    </div>
                    {envCredentials ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs px-3 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Via .env.local
                        </Badge>
                    ) : hasCredentials ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs px-3 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Configured
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs px-3 py-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                            Not configured
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-8">
                    {envCredentials ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm font-medium text-blue-800">
                            <strong>Credentials loaded from environment variables</strong> (.env.local).
                            <br />
                            The form below shows the current values (masked). To change them, update the env file and redeploy.
                        </div>
                    ) : null}

                    {isTestMode && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm font-medium text-amber-800">
                            <strong>Test mode active</strong> — using a <code>sk_test_</code> key. Real money will not be charged. Switch to a <code>sk_live_</code> key when ready to go live.
                        </div>
                    )}

                    <form action={saveYocoSettings} className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                Secret Key (sk_test_ or sk_live_)
                            </Label>
                            <Input
                                name="yoco_secret_key"
                                defaultValue={
                                    envCredentials
                                        ? maskValue(process.env.YOCO_SECRET_KEY!)
                                        : settings.secret_key === 'not_set'
                                          ? ''
                                          : settings.secret_key
                                }
                                disabled={!!envCredentials}
                                placeholder="sk_test_..."
                                className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                Public Key (pk_test_ or pk_live_)
                            </Label>
                            <Input
                                name="yoco_public_key"
                                defaultValue={
                                    envCredentials
                                        ? maskValue(process.env.YOCO_PUBLIC_KEY || '')
                                        : settings.public_key === 'not_set'
                                          ? ''
                                          : settings.public_key
                                }
                                disabled={!!envCredentials}
                                placeholder="pk_test_..."
                                className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-xs font-black text-primary/40">
                                Webhook Secret (whsec_)
                            </Label>
                            <Input
                                name="yoco_webhook_secret"
                                defaultValue={
                                    envCredentials
                                        ? maskValue(process.env.YOCO_WEBHOOK_SECRET || '')
                                        : settings.webhook_secret === 'not_set'
                                          ? ''
                                          : settings.webhook_secret
                                }
                                disabled={!!envCredentials}
                                placeholder="whsec_..."
                                className="h-14 rounded-xl bg-white shadow-sm font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Get this by registering your webhook URL <code className="text-primary">/api/payments/yoco-webhook</code> via Yoco's dashboard or <code className="text-primary">POST /api/webhooks</code>.
                            </p>
                        </div>

                        {!envCredentials && (
                            <Button
                                type="submit"
                                className="h-14 rounded-xl font-bold text-base px-8 bg-primary hover:bg-primary/90"
                            >
                                Save Yoco Configuration
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
