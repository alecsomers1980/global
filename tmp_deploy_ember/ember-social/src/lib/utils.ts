import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function generateToken(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'google_business'] as const
export type Platform = typeof PLATFORMS[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    google_business: 'Google Business',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    youtube: '#FF0000',
    google_business: '#4285F4',
}

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
    facebook: 63206,
    instagram: 2200,
    linkedin: 3000,
    tiktok: 2200,
    youtube: 5000,
    google_business: 1500,
}

export const POST_STATUSES = ['draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed'] as const
export type PostStatus = typeof POST_STATUSES[number]

export const STATUS_LABELS: Record<PostStatus, string> = {
    draft: 'Draft',
    pending_approval: 'Awaiting Approval',
    approved: 'Approved',
    scheduled: 'Scheduled',
    publishing: 'Publishing',
    published: 'Published',
    failed: 'Failed',
}

export const STATUS_COLORS: Record<PostStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_approval: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    publishing: 'bg-purple-100 text-purple-700',
    published: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
}
