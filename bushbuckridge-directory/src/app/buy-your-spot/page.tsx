'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SecondaryHeader from '@/components/SecondaryHeader'
import { Sparkles, Send, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function BuyYourSpotPage() {
  const [loading, setLoading] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    sector: '',
    area: '',
    phone: '',
    whatsapp: '',
    website: '',
    description: '',
    tier: 'pro-lead',
  })

  useEffect(() => {
    async function fetchTaxonomies() {
      try {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
        const [sectorsRes, areasRes] = await Promise.all([
          fetch(`${pbUrl}/api/collections/sectors/records?sort=name&perPage=100`),
          fetch(`${pbUrl}/api/collections/areas/records?sort=name&perPage=100`),
        ])
        const sectorsData = await sectorsRes.json()
        const areasData = await areasRes.json()
        setSectors(sectorsData.items || [])
        setAreas(areasData.items || [])
      } catch (e) {
        console.error('Failed to load form data', e)
      }
    }
    fetchTaxonomies()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/payments/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.firstName,
          last_name: form.lastName,
          business_name: form.businessName,
          sector: form.sector || null,
          area: form.area || null,
          phone: form.phone || null,
          whatsapp: form.whatsapp || null,
          website: form.website || null,
          description: form.description || null,
          tier: form.tier,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      if (!data.redirect_url) {
        toast.error('Payment provider did not return a redirect URL.')
        setLoading(false)
        return
      }
      window.location.href = data.redirect_url
    } catch (err) {
      console.error('Setup payment error:', err)
      toast.error('Connection error. Please check your internet and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col pb-24">
      <SecondaryHeader
        title="Reserve Your Spot"
        subtitle="Join the Bushbuckridge Business Directory to increase your local visibility and reach more customers."
        badge="GROW YOUR BUSINESS"
        backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop"
      />

      <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-2">
                <CardTitle className="text-3xl font-black tracking-tight text-primary">
                  Create Your Listing
                </CardTitle>
                <CardDescription className="text-lg font-medium">
                  Fill in your details below. You&apos;ll be redirected to Yoco to complete payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-6">
                <form onSubmit={handleSubmit} className="space-y-8" ref={formRef}>
                  {/* Account section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary/40">
                      Account Details
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          required
                          value={form.firstName}
                          onChange={(e) => update('firstName', e.target.value)}
                          className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          required
                          value={form.lastName}
                          onChange={(e) => update('lastName', e.target.value)}
                          className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        />
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            className="h-14 rounded-2xl bg-white/50 border-primary/10 pr-12"
                            placeholder="Min. 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary/40">
                      Business Details
                    </h3>
                    <div className="space-y-3">
                      <Label htmlFor="businessName" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                        Business Name *
                      </Label>
                      <Input
                        id="businessName"
                        required
                        value={form.businessName}
                        onChange={(e) => update('businessName', e.target.value)}
                        className="h-14 rounded-2xl bg-white/50 border-primary/10"
                      />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="sector" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Primary Sector
                        </Label>
                        <Select value={form.sector} onValueChange={(v) => update('sector', v)}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
                            <SelectValue placeholder="Select a sector" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {sectors.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="area" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Location / Area
                        </Label>
                        <Select value={form.area} onValueChange={(v) => update('area', v)}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
                            <SelectValue placeholder="Select an area" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {areas.map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="whatsapp" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                          WhatsApp Number
                        </Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => update('whatsapp', e.target.value)}
                          className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                        Website (optional)
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)}
                        className="h-14 rounded-2xl bg-white/50 border-primary/10"
                        placeholder="https://"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                        About Your Business
                      </Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder="Tell us a bit about your services..."
                        className="resize-none rounded-[2rem] bg-white/50 border-primary/10 p-6"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Package selection */}
                  <div className="space-y-3">
                    <Label htmlFor="tier" className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
                      Package *
                    </Label>
                    <Select value={form.tier} onValueChange={(v) => update('tier', v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-primary/10">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="basic">Basic Listing — R199/yr</SelectItem>
                        <SelectItem value="pro-lead">Pro Lead Package — R799/yr</SelectItem>
                        <SelectItem value="pro-business">Pro Business Listing — R10 500/yr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-20 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Redirecting to Yoco...
                      </>
                    ) : (
                      <>
                        Pay with Yoco <Send className="ml-3 h-6 w-6" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary/10 backdrop-blur-xl border border-secondary/20 p-10 rounded-[2.5rem] shadow-xl">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-primary mb-4">Why List With Us?</h3>
              <ul className="space-y-4">
                {[
                  'Reach over 10,000 monthly visitors',
                  'Improve your local SEO visibility',
                  'Connect with corporate partners',
                  'Digital presence for your brand',
                  'Premium business spotlight opportunities',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/5 p-10 rounded-[2.5rem]">
              <h3 className="text-xl font-black tracking-tight text-primary mb-4 flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> Secure Payment
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Payments are processed securely through Yoco. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
