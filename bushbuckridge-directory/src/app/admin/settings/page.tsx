import { requireAdmin } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function AdminSettingsPage() {
    const user = await requireAdmin()

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
        </div>
    )
}
