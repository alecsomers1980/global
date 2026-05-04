'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

const TIERS = [
  {
    key: 'basic',
    label: 'Basic',
    price: 'R199/yr',
    features: ['Directory listing', 'Contact details visible', 'Search appearance'],
  },
  {
    key: 'pro-lead',
    label: 'Pro Lead',
    price: 'R799/yr',
    features: ['Everything in Basic', 'WhatsApp quick-link', 'Website link', 'Performance analytics'],
  },
  {
    key: 'pro-business',
    label: 'Pro Business',
    price: 'R10 500/yr',
    features: [
      'Everything in Pro Lead',
      'Spotlight article feature',
      'Priority search placement',
      'Featured badge',
      'Premium support',
    ],
  },
]

interface Props {
  businessId: string
  currentTier: string
}

export default function UpgradeButton({ businessId, currentTier }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(tier: string) {
    if (tier === currentTier) return
    setLoading(tier)

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, tier }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Could not initiate payment.')
        setLoading(null)
        return
      }

      // Auto-submit to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.payfast_url
      form.style.display = 'none'

      for (const [key, value] of Object.entries(data.form_fields)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      }

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      console.error('Upgrade error:', err)
      toast.error('Connection error. Please try again.')
      setLoading(null)
    }
  }

  const currentIndex = TIERS.findIndex((t) => t.key === currentTier)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-primary">Your Plan</h2>
        <p className="text-muted-foreground font-medium mt-1">
          Upgrade your package to unlock more features and visibility.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isCurrent = tier.key === currentTier
          const isUpgrade = TIERS.indexOf(tier) > currentIndex
          const isLoading = loading === tier.key

          return (
            <Card
              key={tier.key}
              className={`border-0 shadow-xl rounded-[2rem] overflow-hidden transition-all ${
                isCurrent
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : 'bg-card/60 backdrop-blur-xl'
              }`}
            >
              <CardHeader className="p-6 pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-primary'}`}>
                    {tier.label}
                  </CardTitle>
                  {isCurrent && (
                    <Badge className="bg-white/20 text-white border-0 font-bold text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <CardDescription className={isCurrent ? 'text-white/70' : ''}>
                  <span className={`text-2xl font-black ${isCurrent ? 'text-secondary' : 'text-primary'}`}>
                    {tier.price}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <ul className="space-y-2">
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        isCurrent ? 'text-white/80' : 'text-muted-foreground'
                      }`}
                    >
                      <Check className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-secondary' : 'text-emerald-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isUpgrade && (
                  <Button
                    onClick={() => handleUpgrade(tier.key)}
                    disabled={!!loading}
                    className={`w-full h-12 rounded-xl font-bold mt-3 ${
                      isCurrent
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Redirecting...' : 'Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
