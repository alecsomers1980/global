import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function BuyYourSpotSuccessPage() {
    return (
        <div className="container max-w-lg mx-auto px-4 py-20 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Request Received!</h1>
            <p className="text-muted-foreground text-lg mb-6">
                Thank you for your interest in listing your business on the Bushbuckridge Business Journal.<br />
                Our sales team will contact you within <strong>1–2 business days</strong> with an invoice and proof of concept.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                    <Link href="/directory">Browse the Directory</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    )
}
