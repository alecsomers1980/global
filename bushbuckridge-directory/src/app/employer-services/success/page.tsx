import { Button } from '@/components/ui/button'
import { CheckCircle2, Home, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function EmployerServicesSuccessPage() {
    return (
        <div className="container max-w-lg mx-auto px-4 py-24 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Job Request Sent!</h1>
            <p className="text-muted-foreground text-lg mb-8">
                Thank you. Our team will review the details and get your job posting live on the directory soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2">
                    <Link href="/jobs"><Briefcase className="h-4 w-4" /> View Jobs Board</Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <Link href="/"><Home className="h-4 w-4" /> Back to Home</Link>
                </Button>
            </div>
        </div>
    )
}
