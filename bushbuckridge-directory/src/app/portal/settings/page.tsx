import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ClientSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!business) redirect('/')

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Profile Settings</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage your digital presence on the directory.</p>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">Business Information</CardTitle>
                    <CardDescription className="text-base font-medium">To maintain the integrity of our verified directory, core business details must be updated through our support team.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Business Name</p>
                            <p className="font-bold text-lg">{business.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Current Package Tier</p>
                            <p className="font-bold text-lg capitalize">{business.package_tier || 'Standard'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Contact Email</p>
                            <p className="font-bold text-lg">{business.email || 'None Provided'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Contact Phone</p>
                            <p className="font-bold text-lg">{business.phone || 'None Provided'}</p>
                        </div>
                    </div>
                </CardContent>
                <div className="p-8 pt-0 flex gap-4">
                    <Button className="h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl px-8" asChild>
                        <a href="mailto:support@rimintsu.co.za?subject=Profile Update Request">Request Profile Update</a>
                    </Button>
                </div>
            </Card>
        </div>
    )
}
