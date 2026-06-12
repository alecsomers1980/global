import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export default async function AdminRevenuePage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const pb = await createClient()
  const user = pb.authStore.model
  const resolvedSearchParams = await searchParams
  const q = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.toLowerCase() : ''

  if (!user || !user.is_admin) {
    redirect('/admin/login')
  }

  // Get all payments
  let payments: any[] = []
  try {
    payments = await pb.collection('payments').getFullList({
      expand: 'business',
    })

    // Client-side array filtering for search
    if (q) {
      payments = payments.filter((p) => {
        const desc = (p.description || '').toLowerCase()
        const ref = (p.reference || '').toLowerCase()
        const bizName = (p.expand?.business?.name || '').toLowerCase()
        return desc.includes(q) || ref.includes(q) || bizName.includes(q)
      })
    }
  } catch (e) {
    console.error('Failed to fetch payments', e)
  }

  // Calculate revenue metrics
  const successfulPayments = payments.filter(p => p.status === 'successful')
  const pendingPayments = payments.filter(p => p.status === 'pending')
  const totalRevenueCents = successfulPayments.reduce((sum, p) => sum + p.amount_cents, 0)
  const pendingRevenueCents = pendingPayments.reduce((sum, p) => sum + p.amount_cents, 0)

  // This month's revenue
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const thisMonthPayments = successfulPayments.filter(p => {
    const raw = p.paid_at || p.created
    if (!raw) return false
    const paidAt = new Date(raw)
    if (isNaN(paidAt.getTime())) return false
    return paidAt >= monthStart && paidAt <= monthEnd
  })
  const thisMonthRevenueCents = thisMonthPayments.reduce((sum, p) => sum + p.amount_cents, 0)

  // Last month comparison
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))
  const lastMonthPayments = successfulPayments.filter(p => {
    const raw = p.paid_at || p.created
    if (!raw) return false
    const paidAt = new Date(raw)
    if (isNaN(paidAt.getTime())) return false
    return paidAt >= lastMonthStart && paidAt <= lastMonthEnd
  })
  const lastMonthRevenueCents = lastMonthPayments.reduce((sum, p) => sum + p.amount_cents, 0)

  // Active subscriptions count
  let activeSubCount = 0
  try {
    const activeSubs = await pb.collection('subscriptions').getList(1, 1, {
      filter: 'status = "active"',
    })
    activeSubCount = activeSubs.totalItems
  } catch (e) {}

  const formatZAR = (cents: number) => `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  const statusBadge = (status: string) => {
    switch (status) {
      case 'successful':
        return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Track payments, subscriptions, and monthly earnings.</p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search payments..."
            className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Search
          </button>
        </form>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-4 w-4 text-green-700" /></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Revenue</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{formatZAR(totalRevenueCents)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="h-4 w-4 text-blue-700" /></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">This Month</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{formatZAR(thisMonthRevenueCents)}</p>
            <p className="text-xs text-gray-400 mt-1">Last month: {formatZAR(lastMonthRevenueCents)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock className="h-4 w-4 text-amber-700" /></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{formatZAR(pendingRevenueCents)}</p>
            <p className="text-xs text-gray-400 mt-1">{pendingPayments.length} pending payments</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Building2 className="h-4 w-4 text-purple-700" /></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Subs</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{activeSubCount || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Transactions */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="p-6 pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm mt-1">Payments will appear here once businesses subscribe.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.description || 'Listing Payment'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.expand?.business?.name || 'Unknown'} &middot; {(p.paid_at || p.created) ? format(new Date(p.paid_at || p.created), 'dd MMM yyyy, HH:mm') : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-bold text-sm text-gray-900 whitespace-nowrap">{formatZAR(p.amount_cents)}</span>
                    {statusBadge(p.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}