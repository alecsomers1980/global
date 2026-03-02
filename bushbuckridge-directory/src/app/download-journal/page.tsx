import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { BookOpen, Download, Shield, Sparkles } from 'lucide-react'
import SecondaryHeader from '@/components/SecondaryHeader'

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
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Business Journal"
                subtitle="Get your free copy of the 2026 Doing Business in Bushbuckridge Directory. Complete with sector guides and maps."
                badge="ANNUAL PUBLICATION"
                backgroundImage="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="container max-w-2xl mx-auto px-4 -mt-24 relative z-20">
                <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3.5rem] overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-10">
                        <BookOpen className="h-32 w-32 text-primary" />
                    </div>

                    <CardHeader className="p-12 text-center">
                        <div className="mx-auto h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <Download className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-4xl font-black tracking-tight mb-4">Digital Access</CardTitle>
                        <CardDescription className="text-lg font-medium max-w-md mx-auto leading-relaxed">
                            Enter your professional email to instantly unlock the full annual directory and business guide.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-12 pb-12">
                        <form action={captureEmailAndRedirect} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-primary/40 ml-1">Work Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@business.com"
                                    required
                                    className="h-16 rounded-2xl border-primary/10 bg-white/50 focus:ring-primary/20 transition-all px-6 text-lg font-medium"
                                />
                            </div>
                            <Button type="submit" className="w-full h-18 text-xl font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3">
                                <Download className="h-6 w-6" /> Download PDF Guide
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-primary/5 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span>Zero-Spam Policy • Managed by RVR Inc</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/40 font-medium text-center">
                                By downloading, you agree to receive essential business updates. Your data remains private and protected under POPIA.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
