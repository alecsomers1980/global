'use server'

import { createServiceClient } from '@/utils/pocketbase/service'
import { redirect } from 'next/navigation'

function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function submitJobPosting(formData: FormData) {
    const title = String(formData.get('title') || '')
    if (!formData.get('positions')) formData.delete('positions')
    formData.set('slug', `${slugify(title) || 'job'}-${Math.random().toString(36).slice(2, 7)}`)
    formData.set('status', 'pending')

    try {
        const pb = await createServiceClient()
        await pb.collection('jobs').create(formData)

        const { sendEnquiryNotification, sendEnquiryConfirmation } = await import('@/lib/email')
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dbib.co.za'
        const company = String(formData.get('company') || '')
        const contactName = String(formData.get('contact_name') || '')
        const contactEmail = String(formData.get('contact_email') || '')
        const contactNumber = String(formData.get('contact_number') || '')
        const details = [
            `Job Title: ${title}`,
            formData.get('type') && `Job Type: ${formData.get('type')}`,
            formData.get('location') && `Location: ${formData.get('location')}`,
            formData.get('positions') && `Positions: ${formData.get('positions')}`,
            formData.get('salary') && `Salary: ${formData.get('salary')}`,
            formData.get('experience_level') && `Experience: ${formData.get('experience_level')}`,
            formData.get('closing_date') && `Closing Date: ${formData.get('closing_date')}`,
        ].filter(Boolean).join('\n')

        await sendEnquiryNotification({
            type: 'Employer Services — Job Posting Request',
            businessName: company,
            contactPerson: contactName,
            email: contactEmail,
            phone: contactNumber,
            details,
        }).catch((e) => console.error('Employer services notification failed:', e))
        if (contactEmail) {
            await sendEnquiryConfirmation({
                to: contactEmail,
                contactPerson: contactName,
                businessName: company,
                siteUrl,
            }).catch((e) => console.error('Confirmation email failed:', e))
        }
    } catch (e) {
        console.error('Job posting submission error:', e)
        throw new Error('Could not submit your job posting. Please try again.')
    }

    redirect('/employer-services/success')
}
