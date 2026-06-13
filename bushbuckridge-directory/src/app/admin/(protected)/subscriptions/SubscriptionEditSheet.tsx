'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { updateSubscription } from './actions'
import { toast } from 'sonner'

export default function SubscriptionEditSheet({
    open,
    onClose,
    subscription,
}: {
    open: boolean
    onClose: () => void
    subscription: any
}) {
    const [tier, setTier] = useState('')
    const [status, setStatus] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [amountRands, setAmountRands] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && subscription) {
            setTier(subscription.tier || '')
            setStatus(subscription.status || '')
            setExpiresAt(subscription.expires_at?.slice(0, 10) || '')
            setAmountRands((subscription.amount_cents || 0) / 100)
        }
    }, [open, subscription])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            await updateSubscription(subscription.id, {
                tier,
                status,
                expires_at: expiresAt,
                amount_cents: Math.round(amountRands * 100),
            })
            toast.success('Subscription updated')
            onClose()
        } catch (e: any) {
            toast.error(e.message || 'Failed to update subscription')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight text-primary">
                        Edit Subscription
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        Update tier, status, renewal date, and amount.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-5">
                    {subscription?.expand?.business?.name && (
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-primary/60">Business</Label>
                            <div className="h-12 rounded-xl border bg-muted/30 flex items-center px-4 text-sm font-bold text-primary">
                                {subscription.expand.business.name}
                            </div>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-primary/60">Tier</Label>
                            <Select value={tier} onValueChange={(v) => setTier(v)}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="pro-lead">Pro Lead</SelectItem>
                                    <SelectItem value="pro-business">Pro Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-primary/60">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v)}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-primary/60">
                                Renewal Date
                            </Label>
                            <Input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-primary/60">
                                Amount (R)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amountRands}
                                onChange={(e) => setAmountRands(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}