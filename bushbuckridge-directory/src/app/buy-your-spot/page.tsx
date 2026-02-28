import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { redirect } from 'next/navigation'

export default async function BuyYourSpotPage() {
    const supabase = await createClient()
    const { data: sectors } = await supabase.from('sectors').select('id, name').order('name')
    const { data: areas } = await supabase.from('areas').select('id, name').order('name')

    async function submitLead(formData: FormData) {
        'use server'

        const db = await createClient()

        // In a real app, you would add Zod validation here
        const { error } = await db.from('enquiries').insert({
            type: 'buy_spot',
            business_name: formData.get('businessName'),
            contact_person: String(formData.get('contactName')),
            phone: formData.get('phone'),
            email: formData.get('email'),
            package_requested: formData.get('package'),
            details: formData.get('notes'),
        })

        if (!error) {
            redirect('/buy-your-spot/success')
        } else {
            console.error(error)
            // Note: Error handling in Server Actions without client-side state is basic.
            // Evolving this to a client component with `useActionState` is better for UX.
            redirect('/buy-your-spot?error=true')
        }
    }

    return (
        <div className="container max-w-2xl mx-auto px-4 py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl tracking-tight font-bold text-primary mb-2">Reserve Your Spot</h1>
                <p className="text-muted-foreground">
                    Join the Bushbuckridge Business Directory to increase your local visibility.
                    Fill out the form below and our sales team will contact you.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Details</CardTitle>
                    <CardDescription>All fields marked with an asterisk (*) are required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={submitLead} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name *</Label>
                                <Input id="businessName" name="businessName" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactName">Contact Person *</Label>
                                <Input id="contactName" name="contactName" required />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone / WhatsApp *</Label>
                                <Input id="phone" name="phone" type="tel" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sector">Primary Sector</Label>
                                <Select name="sector">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a sector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectors?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Location / Area</Label>
                                <Select name="area">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="package">Requested Package</Label>
                            <Select name="package" defaultValue="standard">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard Listing (Free)</SelectItem>
                                    <SelectItem value="enhanced">Enhanced Listing</SelectItem>
                                    <SelectItem value="premium">Premium Showcase</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Tell us a bit about your services..."
                                className="resize-none"
                                rows={4}
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg">Submit Request</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
