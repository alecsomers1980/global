import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SecondaryHeader from '@/components/SecondaryHeader'
import JobPostingForm from './JobPostingForm'

export default function EmployerServicesPage() {
    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title="Employer Services"
                subtitle="Looking to hire? Tell us about the role and our team will review and list it on the Jobs board."
                badge="POST A JOB"
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Post a Job Opening</CardTitle>
                        <CardDescription>Submissions are reviewed by our team before appearing on the Jobs board.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JobPostingForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
