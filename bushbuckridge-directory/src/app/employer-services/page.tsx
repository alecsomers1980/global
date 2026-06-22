import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import SecondaryHeader from '@/components/SecondaryHeader'

export default function EmployerServicesPage() {
    async function submitJobRequest(formData: FormData) {
        'use server'
        const businessName = String(formData.get('businessName') || '')
        const contactPerson = String(formData.get('contactPerson') || '')
        const email = String(formData.get('email') || '')
        const phone = String(formData.get('phone') || '')
        const jobTitle = String(formData.get('jobTitle') || '')
        const jobType = String(formData.get('jobType') || '')
        const location = String(formData.get('location') || '')
        const positions = String(formData.get('positions') || '')
        const salary = String(formData.get('salary') || '')
        const closingDate = String(formData.get('closingDate') || '')
        const description = String(formData.get('description') || '')

        const metaLines = [
            `Job Title: ${jobTitle}`,
            jobType && `Job Type: ${jobType}`,
            location && `Location: ${location}`,
            positions && `Number of Positions: ${positions}`,
            salary && `Salary / Compensation: ${salary}`,
            closingDate && `Closing Date: ${closingDate}`,
        ].filter(Boolean).join('\n')
        const details = `${metaLines}\n\nJob Description & Requirements:\n${description}`

        let ok = false
        try {
            const pb = await createClient()
            await pb.collection('enquiries').create({
                type: 'employer_services',
                business_name: businessName,
                contact_person: contactPerson,
                phone,
                email,
                details,
                status: 'new',
            })

            const { sendEnquiryNotification, sendEnquiryConfirmation } = await import('@/lib/email')
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dbib.co.za'
            await sendEnquiryNotification({
                type: 'Employer Services — Job Posting Request',
                businessName,
                contactPerson,
                email,
                phone,
                details,
            }).catch((e) => console.error('Employer services notification failed:', e))
            if (email) {
                await sendEnquiryConfirmation({
                    to: email,
                    contactPerson,
                    businessName,
                    siteUrl,
                }).catch((e) => console.error('Confirmation email failed:', e))
            }
            ok = true
        } catch (e) {
            console.error('Employer services submission error:', e)
        }
        redirect(ok ? '/employer-services/success' : '/employer-services?error=true')
    }

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
                        <CardTitle>Request a Job Posting</CardTitle>
                        <CardDescription>Submissions are reviewed by our team before appearing on the Jobs board.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={submitJobRequest} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Company Name *</Label>
                                    <Input id="businessName" name="businessName" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person *</Label>
                                    <Input id="contactPerson" name="contactPerson" required />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Contact Email *</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Phone</Label>
                                    <Input id="phone" name="phone" type="tel" />
                                </div>
                            </div>

                            <div className="border-t pt-6 space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title *</Label>
                                        <Input id="jobTitle" name="jobTitle" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobType">Job Type</Label>
                                        <select
                                            id="jobType"
                                            name="jobType"
                                            defaultValue=""
                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            <option value="">Select type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Temporary">Temporary</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" name="location" placeholder="e.g. Acornhoek" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="positions">Number of Positions</Label>
                                        <Input id="positions" name="positions" type="number" min={1} />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salary">Salary / Compensation</Label>
                                        <Input id="salary" name="salary" placeholder="e.g. Market related" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="closingDate">Closing Date</Label>
                                        <Input id="closingDate" name="closingDate" type="date" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Job Description & Requirements *</Label>
                                    <Textarea id="description" name="description" rows={6} className="resize-none" required />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11">Submit Request</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
