import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { BookOpen, Download, Shield } from 'lucide-react'

// The PDF would be stored in Supabase Storage. Update this URL once uploaded.
const JOURNAL_PDF_URL = process.env.NEXT_PUBLIC_JOURNAL_PDF_URL || '#'

export default function DownloadJournalPage() {
    async function captureEmailAndRedirect(formData: FormData) {
        'use server'
        const email = formData.get('email') as string

        // Save email lead to enquiries table
        const db = await createClient()
        await db.from('enquiries').insert({
            type: 'general',
            contact_person: 'Journal Download',
            email: email,
            details: 'Requested journal download',
        })

        // Redirect to the actual PDF
        redirect(JOURNAL_PDF_URL)
    }

    return (
        <div className="container max-w-lg mx-auto px-4 py-16 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-3">Annual Business Journal</h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                Get your free copy of the 2026 Doing Business in Bushbuckridge Directory. Complete with sector guides, key contacts, and area maps.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Get Your Free PDF</CardTitle>
                    <CardDescription>Enter your email to receive the download. We respect your privacy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={captureEmailAndRedirect} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <Button type="submit" className="w-full h-11 gap-2">
                            <Download className="h-4 w-4" /> Download Now
                        </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                        <Shield className="h-3 w-3" />
                        We will not share your email with third parties.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
