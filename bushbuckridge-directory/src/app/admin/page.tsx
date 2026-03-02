import { requireAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Activity, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
    await requireAdmin()
    const supabase = await createClient()

    // Fetch quick stats
    const { count: businessCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true })
    const { count: pendingCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const { count: premiumCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('package_tier', 'premium')
    const { count: enquiriesCount } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new')

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Dashboard Overview</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Welcome to your Directory Command Center.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardMetric
                    title="Total Businesses"
                    value={businessCount?.toString() || '0'}
                    icon={Briefcase}
                    trend="+4 this week"
                />
                <DashboardMetric
                    title="Premium Listings"
                    value={premiumCount?.toString() || '0'}
                    icon={CheckCircle2}
                    trend="Generating Revenue"
                    highlight
                />
                <DashboardMetric
                    title="Pending Approvals"
                    value={pendingCount?.toString() || '0'}
                    icon={AlertCircle}
                    trend="Requires Action"
                    warning={!!pendingCount && pendingCount > 0}
                />
                <DashboardMetric
                    title="New Enquiries"
                    value={enquiriesCount?.toString() || '0'}
                    icon={Activity}
                    trend="Unread Leads"
                    warning={!!enquiriesCount && enquiriesCount > 0}
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Leads */}
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black">Recent Enquiries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="space-y-4">
                            <p className="text-muted-foreground font-medium">To see specific enquiries, implement the enquiry list here.</p>
                            {/* We will implement enquiry mapping here later */}
                        </div>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-sm uppercase tracking-widest">All Systems Operational</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function DashboardMetric({ title, value, icon: Icon, trend, highlight, warning }: any) {
    return (
        <Card className={`border-0 shadow-lg rounded-[1.5rem] overflow-hidden ${highlight ? 'bg-primary text-primary-foreground' : warning ? 'bg-amber-50 border border-amber-200' : 'bg-card'}`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-white/20' : warning ? 'bg-amber-200/50' : 'bg-primary/5'}`}>
                        <Icon className={`h-6 w-6 ${highlight ? 'text-white' : warning ? 'text-amber-600' : 'text-primary'}`} />
                    </div>
                </div>
                <div>
                    <h3 className={`text-4xl font-black tracking-tight ${highlight ? 'text-white' : warning ? 'text-amber-700' : 'text-primary'}`}>{value}</h3>
                    <p className={`text-sm font-bold mt-1 ${highlight ? 'text-white/80' : warning ? 'text-amber-600/80' : 'text-muted-foreground'}`}>{title}</p>
                </div>
                <div className={`mt-4 text-xs font-bold tracking-widest uppercase ${highlight ? 'text-secondary' : warning ? 'text-amber-500' : 'text-primary/40'}`}>
                    {trend}
                </div>
            </CardContent>
        </Card>
    )
}
