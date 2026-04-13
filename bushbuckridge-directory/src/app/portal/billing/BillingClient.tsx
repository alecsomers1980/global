'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

const TIER_LABELS: Record<string, string> = {
  standard: 'Standard',
  enhanced: 'Enhanced',
  premium: 'Premium',
}

const TIER_PRICES: Record<string, string> = {
  standard: 'R199',
  enhanced: 'R499',
  premium: 'R999',
}

const TIER_FEATURES: Record<string, string[]> = {
  standard: ['Basic listing', 'Contact details shown', 'Category placement'],
  enhanced: ['Everything in Standard', 'Priority placement', 'Analytics dashboard', 'Photo gallery'],
  premium: ['Everything in Enhanced', 'Featured badge', 'Homepage spotlight', 'Full analytics', 'Priority support'],
}

interface BillingClientProps {
  business: {
    id: string
    name: string
    package_tier: string
  }
  subscription: {
    id: string
    tier: string
    status: string
    expires_at: string | null
    amount_cents: number
  } | null
  payments: {
    id: string
    amount_cents: number
    status: string
    provider: string
    paid_at: string | null
    created_at: string
    description: string | null
  }[]
}

export default function BillingClient({ business, subscription, payments }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (tier: string) => {
    setLoading(tier)
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: business.id, tier }),
      })
      const data = await res.json()

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert(data.error || 'Payment initialization failed')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'expired':
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      case 'successful':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your listing plan and payment history.</p>
      </div>

      {/* Current Plan */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="p-6 pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-2xl font-extrabold text-primary capitalize">{TIER_LABELS[business.package_tier] || 'Standard'}</p>
              <p className="text-sm text-gray-500 mt-1">
                {subscription?.status === 'active' && subscription.expires_at
                  ? `Renews ${new Date(subscription.expires_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'No active subscription'}
              </p>
            </div>
            {subscription && statusBadge(subscription.status)}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {(['standard', 'enhanced', 'premium'] as const).map((tier) => {
            const isCurrentTier = business.package_tier === tier
            return (
              <Card key={tier} className={`border rounded-xl transition-all ${isCurrentTier ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base capitalize">{TIER_LABELS[tier]}</h3>
                    {isCurrentTier && <Badge className="bg-primary text-white text-xs">Current</Badge>}
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mb-4">{TIER_PRICES[tier]}<span className="text-sm font-normal text-gray-400">/month</span></p>
                  <ul className="space-y-1.5 mb-5">
                    {TIER_FEATURES[tier].map((feature) => (
                      <li key={feature} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrentTier ? (
                    <Button disabled className="w-full h-9 text-sm rounded-lg" variant="outline">Current Plan</Button>
                  ) : (
                    <Button
                      className="w-full h-9 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 font-medium"
                      disabled={loading !== null}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {loading === tier ? 'Processing...' : (
                        <>Upgrade <ArrowUpRight className="h-3.5 w-3.5 ml-1" /></>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4 border-b border-gray-100">
            <CardTitle className="text-lg font-bold">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{p.description || 'Listing Payment'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.paid_at || p.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900">R{(p.amount_cents / 100).toFixed(2)}</span>
                    {statusBadge(p.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
