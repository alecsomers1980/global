'use server'

import { createClient } from '@/utils/supabase/server'

export type AnalyticsEventType = 'profile_view' | 'website_click' | 'whatsapp_click' | 'phone_click'

export async function trackAnalyticsEvent(businessId: string, eventType: AnalyticsEventType) {
    try {
        const supabase = await createClient()

        // Don't await this so it doesn't block the UI response
        supabase.from('analytics_events').insert({
            business_id: businessId,
            event_type: eventType,
        }).then(({ error }) => {
            if (error) console.error('Failed to log analytics event:', error)
        })

        return { success: true }
    } catch (e) {
        console.error('Analytics tracking error:', e)
        return { success: false }
    }
}
