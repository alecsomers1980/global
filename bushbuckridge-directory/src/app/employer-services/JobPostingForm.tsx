'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadField from '@/components/ImageUploadField'
import { submitJobPosting } from './actions'

const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export default function JobPostingForm() {
    const [submitting, setSubmitting] = useState(false)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [galleryFiles, setGalleryFiles] = useState<File[]>([])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        if (imageFiles[0]) fd.append('image', imageFiles[0])
        galleryFiles.forEach((f) => fd.append('gallery', f))

        setSubmitting(true)
        try {
            await submitJobPosting(fd)
        } catch (err: any) {
            // Let Next's redirect signal propagate; only real errors are toasted.
            if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err
            toast.error(err?.message || 'Something went wrong. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" name="company" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Person *</Label>
                    <Input id="contact_name" name="contact_name" required />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input id="contact_email" name="contact_email" type="email" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Phone</Label>
                    <Input id="contact_number" name="contact_number" type="tel" />
                </div>
            </div>

            {/* Job details */}
            <div className="border-t pt-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input id="title" name="title" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Job Type</Label>
                        <select id="type" name="type" defaultValue="" className={selectClass}>
                            <option value="">Select type</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Temporary">Temporary</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="experience_level">Experience Level</Label>
                        <select id="experience_level" name="experience_level" defaultValue="" className={selectClass}>
                            <option value="">Select level</option>
                            <option value="Entry-level">Entry-level</option>
                            <option value="Mid-level">Mid-level</option>
                            <option value="Senior">Senior</option>
                            <option value="Executive">Executive</option>
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
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-1">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" name="salary" placeholder="e.g. R15,000 - R20,000" />
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                        <Label htmlFor="salary_period">Salary Period</Label>
                        <select id="salary_period" name="salary_period" defaultValue="" className={selectClass}>
                            <option value="">Select period</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Annual">Annual</option>
                            <option value="Hourly">Hourly</option>
                            <option value="Negotiable">Negotiable</option>
                        </select>
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                        <Label htmlFor="closing_date">Closing Date</Label>
                        <Input id="closing_date" name="closing_date" type="date" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea id="description" name="description" rows={5} className="resize-none" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="responsibilities">Key Responsibilities</Label>
                    <Textarea id="responsibilities" name="responsibilities" rows={4} className="resize-none" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements / Qualifications</Label>
                    <Textarea id="requirements" name="requirements" rows={4} className="resize-none" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="how_to_apply">How to Apply</Label>
                    <Textarea id="how_to_apply" name="how_to_apply" rows={3} className="resize-none" />
                </div>
            </div>

            {/* Images */}
            <div className="grid md:grid-cols-2 gap-6 pt-2 border-t">
                <ImageUploadField
                    label="Main Photo"
                    hint="Optional. Landscape, recommended 1200 × 675 px (JPG). Max 2MB."
                    files={imageFiles}
                    onFilesChange={setImageFiles}
                />
                <ImageUploadField
                    label="Gallery"
                    multiple
                    maxFiles={5}
                    hint="Optional. Landscape, recommended 1200 × 800 px (JPG). Up to 5 images."
                    files={galleryFiles}
                    onFilesChange={setGalleryFiles}
                />
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                    'Submit for Review'
                )}
            </Button>
        </form>
    )
}
