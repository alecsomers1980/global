import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BuyYourSpotSuccessPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-20 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3">Payment Received!</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Your payment has been processed and your business listing is now active on the Bushbuckridge Community Directory.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/portal">
            Go to Your Portal <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/find-a-service">Browse Services</Link>
        </Button>
      </div>
    </div>
  )
}
