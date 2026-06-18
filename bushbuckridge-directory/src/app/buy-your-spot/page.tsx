'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SecondaryHeader from '@/components/SecondaryHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Check, TrendingUp, Zap, Star, ChevronRight, ChevronLeft, Lock } from 'lucide-react'

const PACKAGES = [
  {
    key: 'basic',
    name: 'Basic Listing',
    price: 'R199',
    period: 'per annum (excl. VAT)',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: TrendingUp,
    featured: false,
    features: ['Business name & description', 'Address & contact details', 'Business logo*', 'Business hours', 'Services list'],
  },
  {
    key: 'pro-lead',
    name: 'Pro Lead Package',
    price: 'R799',
    period: 'per annum (excl. VAT)',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Zap,
    featured: true,
    features: ['Everything in Basic', 'Cover image + 3 photos*', 'WhatsApp & social links', 'Customer reviews & ratings', 'Quote / enquiry button'],
  },
  {
    key: 'pro-business',
    name: 'Pro Business Listing',
    price: 'R10 500',
    period: 'per annum (excl. VAT)',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    icon: Star,
    featured: false,
    features: ['Everything in Pro Lead', 'Up to 10 photos*', 'Website, video & FAQ', 'Certifications, offers & map', 'Monthly performance email', '4 quarterly news updates', 'CSI publications'],
  },
]

const TIER_FIELDS: Record<string, string[]> = {
  basic: ['businessName', 'sector', 'area', 'phone', 'description'],
  'pro-lead': ['businessName', 'sector', 'area', 'phone', 'description', 'whatsapp', 'facebook', 'instagram', 'linkedin'],
  'pro-business': ['businessName', 'sector', 'area', 'phone', 'description', 'whatsapp', 'website', 'facebook', 'instagram', 'linkedin'],
}

const STEPS = ['Account', 'Package', 'Details', 'Review']

function LockedField({ allowed, lockLabel, children }: { allowed: boolean; lockLabel: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {!allowed && (
        <div className="absolute inset-0 rounded-2xl bg-muted/60 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
            <Lock className="h-3 w-3" /> {lockLabel}
          </span>
        </div>
      )}
    </div>
  )
}

function BuyYourSpotWizard() {
  const searchParams = useSearchParams()
  const initialTier = searchParams.get('tier') || 'pro-lead'

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])

  const [account, setAccount] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [tier, setTier] = useState(initialTier)
  const [biz, setBiz] = useState({
    businessName: '', sector: '', area: '', phone: '', description: '',
    whatsapp: '', website: '', facebook: '', instagram: '', linkedin: '',
  })

  useEffect(() => {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    Promise.all([
      fetch(`${pbUrl}/api/collections/sectors/records?sort=name&perPage=100`).then(r => r.json()),
      fetch(`${pbUrl}/api/collections/areas/records?sort=name&perPage=100`).then(r => r.json()),
    ]).then(([s, a]) => {
      setSectors(s.items || [])
      setAreas(a.items || [])
    }).catch(() => {})
  }, [])

  function updateAccount(field: string, value: string) {
    setAccount(prev => ({ ...prev, [field]: value }))
  }
  function updateBiz(field: string, value: string) {
    setBiz(prev => ({ ...prev, [field]: value }))
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!account.firstName || !account.lastName || !account.email || !account.password) {
        toast.error('Please fill in all required fields.')
        return false
      }
      if (account.password.length < 8) {
        toast.error('Password must be at least 8 characters.')
        return false
      }
    }
    if (step === 2) {
      if (!biz.businessName) {
        toast.error('Business name is required.')
        return false
      }
    }
    return true
  }

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          first_name: account.firstName,
          last_name: account.lastName,
          business_name: biz.businessName,
          sector: biz.sector || null,
          area: biz.area || null,
          phone: biz.phone || null,
          whatsapp: biz.whatsapp || null,
          website: biz.website || null,
          description: biz.description || null,
          tier,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.redirect_url
    } catch {
      toast.error('Connection error. Please check your internet and try again.')
      setLoading(false)
    }
  }

  const selectedPkg = PACKAGES.find(p => p.key === tier)!
  const allowedFields = TIER_FIELDS[tier] || []
  const isAllowed = (field: string) => allowedFields.includes(field)

  return (
    <div className="flex flex-col pb-24">
      <SecondaryHeader
        title="Reserve Your Spot"
        subtitle="Join the Bushbuckridge Business Directory to increase your local visibility and reach more customers."
        badge="GROW YOUR BUSINESS"
        backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
      />

      <div className="container max-w-3xl mx-auto px-4 -mt-8 relative z-20">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-all
                ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black tracking-tight text-primary">
              {step === 0 && 'Create Your Account'}
              {step === 1 && 'Choose Your Package'}
              {step === 2 && 'Business Details'}
              {step === 3 && 'Review & Pay'}
            </CardTitle>
            <CardDescription className="font-medium text-base">
              {step === 0 && 'Your account gives you access to manage your listing.'}
              {step === 1 && 'Select the package that best fits your business.'}
              {step === 2 && 'Tell us about your business. Greyed fields unlock with a higher tier.'}
              {step === 3 && 'Review your details and complete payment via Yoco.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 pt-4 space-y-6">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">First Name *</Label>
                    <Input value={account.firstName} onChange={e => updateAccount('firstName', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Last Name *</Label>
                    <Input value={account.lastName} onChange={e => updateAccount('lastName', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Email Address *</Label>
                  <Input type="email" value={account.email} onChange={e => updateAccount('email', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={account.password}
                      onChange={e => updateAccount('password', e.target.value)}
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="h-14 rounded-2xl bg-white/50 border-primary/10 pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Package */}
            {step === 1 && (
              <div className="grid gap-4">
                {PACKAGES.map(pkg => {
                  const Icon = pkg.icon
                  const selected = tier === pkg.key
                  return (
                    <button
                      key={pkg.key}
                      type="button"
                      onClick={() => setTier(pkg.key)}
                      className={`text-left w-full rounded-[2rem] border-2 p-6 transition-all flex gap-5 items-start ${selected ? 'border-primary ring-4 ring-primary/10 bg-primary/5' : 'border-border/40 bg-card/40 hover:border-primary/30'}`}
                    >
                      <div className={`h-14 w-14 ${pkg.bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
                        <Icon className={`h-7 w-7 ${pkg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-black text-lg text-primary">{pkg.name}</span>
                          {pkg.featured && <Badge className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5">POPULAR</Badge>}
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-black text-foreground">{pkg.price}</span>
                          <span className="text-sm text-muted-foreground font-medium">{pkg.period}</span>
                        </div>
                        <ul className="space-y-1">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                              <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={3} /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Business Name *</Label>
                  <Input value={biz.businessName} onChange={e => updateBiz('businessName', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Sector</Label>
                    <Select value={biz.sector} onValueChange={v => updateBiz('sector', v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10"><SelectValue placeholder="Select sector" /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Area</Label>
                    <Select value={biz.area} onValueChange={v => updateBiz('area', v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10"><SelectValue placeholder="Select area" /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Phone Number</Label>
                  <Input type="tel" value={biz.phone} onChange={e => updateBiz('phone', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">About Your Business</Label>
                  <Textarea value={biz.description} onChange={e => updateBiz('description', e.target.value)} rows={7} placeholder="Tell us a bit about your services..." className="resize-none rounded-[1.5rem] bg-white/50 border-primary/10 p-5" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">WhatsApp Number</Label>
                  <LockedField allowed={isAllowed('whatsapp')} lockLabel="Pro Lead+">
                    <Input type="tel" disabled={!isAllowed('whatsapp')} value={biz.whatsapp} onChange={e => updateBiz('whatsapp', e.target.value)} className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                  </LockedField>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">Website</Label>
                  <LockedField allowed={isAllowed('website')} lockLabel="Pro Business">
                    <Input type="url" disabled={!isAllowed('website')} value={biz.website} onChange={e => updateBiz('website', e.target.value)} placeholder="https://" className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                  </LockedField>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  {(['facebook', 'instagram', 'linkedin'] as const).map(field => (
                    <div key={field} className="space-y-2">
                      <Label className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      <LockedField allowed={isAllowed(field)} lockLabel="Pro Lead+">
                        <Input type="url" disabled={!isAllowed(field)} value={biz[field]} onChange={e => updateBiz(field, e.target.value)} placeholder="https://" className="h-14 rounded-2xl bg-white/50 border-primary/10" />
                      </LockedField>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic pt-2">* Logo and photo gallery can be added after sign-up through your client portal.</p>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-[2rem] p-6 space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Account</p>
                    <p className="font-bold text-foreground">{account.firstName} {account.lastName}</p>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  </div>
                  <div className="border-t border-primary/5 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Package</p>
                    <p className="font-bold text-foreground">{selectedPkg.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPkg.price} {selectedPkg.period}</p>
                  </div>
                  <div className="border-t border-primary/5 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Business</p>
                    <p className="font-bold text-foreground">{biz.businessName}</p>
                    {biz.sector && <p className="text-sm text-muted-foreground">{sectors.find(s => s.id === biz.sector)?.name}</p>}
                    {biz.area && <p className="text-sm text-muted-foreground">{areas.find(a => a.id === biz.area)?.name}</p>}
                  </div>
                </div>
                <Button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Redirecting to Yoco...</>
                  ) : (
                    <>Pay with Yoco — {selectedPkg.price}</>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">Payments are processed securely through Yoco. Your card details are never stored on our servers.</p>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex gap-4 pt-4 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="h-12 px-6 font-bold rounded-2xl gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step < 3 && (
                <Button
                  onClick={() => { if (validateStep()) setStep(s => s + 1) }}
                  className="h-12 px-8 font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg gap-2"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BuyYourSpotPage() {
  return (
    <Suspense fallback={null}>
      <BuyYourSpotWizard />
    </Suspense>
  )
}
