'use server'

import { createClient } from '@/utils/pocketbase/server'

export type AnalyticsEventType = 'profile_view' | 'website_click' | 'whatsapp_click' | 'phone_click'

export async function trackAnalyticsEvent(businessId: string, eventType: AnalyticsEventType) {
    try {
        const pb = await createClient()

        // PocketBase analytics event creation
        pb.collection('analytics_events').create({
            business: businessId,
            event_type: eventType,
        }).catch(err => {
            console.error('Failed to log analytics event:', err)
        })

        return { success: true }
    } catch (e) {
        console.error('Analytics tracking error:', e)
        return { success: false }
    }
}
