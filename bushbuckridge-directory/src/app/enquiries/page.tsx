import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { Phone, Mail, MessageCircle } from 'lucide-react'

export default function EnquiriesPage() {
    async function submitEnquiry(formData: FormData) {
        'use server'
        const db = await createClient()
        const { error } = await db.from('enquiries').insert({
            type: 'general',
            contact_person: String(formData.get('name')),
            phone: formData.get('phone'),
            email: formData.get('email'),
            details: formData.get('message'),
        })
        if (!error) redirect('/enquiries/success')
        else redirect('/enquiries?error=true')
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Get in Touch</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Have a question about listing your business, advertising, or anything else? We'd love to hear from you.
                </p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Contact Details */}
                <aside className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Contact Details</h2>
                    <div className="space-y-4">
                        <a href="tel:+27123456789" className="flex items-center gap-3 text-muted-foreground hover:text-foreground group">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-primary/70">Phone</p>
                                <p className="text-sm font-medium text-foreground">+27 12 345 6789</p>
                            </div>
                        </a>
                        <a href="mailto:info@dbib.co.za" className="flex items-center gap-3 text-muted-foreground hover:text-foreground group">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-primary/70">Email</p>
                                <p className="text-sm font-medium text-foreground">info@dbib.co.za</p>
                            </div>
                        </a>
                        <a href="https://wa.me/27123456789" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground group">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-primary/70">WhatsApp</p>
                                <p className="text-sm font-medium text-foreground">+27 12 345 6789</p>
                            </div>
                        </a>
                    </div>
                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Looking to list your business? Head over to our{' '}
                            <a href="/buy-your-spot" className="text-primary font-medium hover:underline">Reserve Your Spot</a>{' '}
                            page.
                        </p>
                    </div>
                </aside>

                {/* Enquiry Form */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Send a Message</CardTitle>
                        <CardDescription>We typically respond within 1–2 business days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={submitEnquiry} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone / WhatsApp</Label>
                                    <Input id="phone" name="phone" type="tel" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea id="message" name="message" rows={5} className="resize-none" required />
                            </div>
                            <Button type="submit" className="w-full h-11">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
