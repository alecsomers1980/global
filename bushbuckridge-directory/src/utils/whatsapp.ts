/**
 * Normalizes a South African phone number to +27 format for WhatsApp links.
 * Handles cases like: 073..., +2773..., 2773..., or numbers with spaces/dashes.
 */
export function normalizeWhatsAppNumber(number: string): string {
    // Remove all non-numeric characters
    const cleanNumber = number.replace(/\D/g, '')

    if (!cleanNumber) return ''

    // If starts with 0 and followed by 9 digits (standard local format e.g. 0731234567)
    if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
        return `27${cleanNumber.substring(1)}`
    }

    // If starts with 27 and followed by 9 digits (international without + e.g. 27731234567)
    if (cleanNumber.startsWith('27') && cleanNumber.length === 11) {
        return cleanNumber
    }

    // Default: return the cleaned number
    return cleanNumber
}

/**
 * Generates a full WhatsApp click-to-chat URL.
 */
export function getWhatsAppUrl(number: string, message?: string): string {
    const normalized = normalizeWhatsAppNumber(number)
    const baseUrl = `https://wa.me/${normalized}`

    if (message) {
        return `${baseUrl}?text=${encodeURIComponent(message)}`
    }

    return baseUrl
}
