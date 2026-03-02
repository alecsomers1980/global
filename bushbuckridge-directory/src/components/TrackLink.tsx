'use client'

import { trackAnalyticsEvent, AnalyticsEventType } from '@/app/actions/analytics'
import React from 'react'

interface TrackLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    businessId: string
    eventType: AnalyticsEventType
}

export function TrackLink({ businessId, eventType, children, onClick, ...props }: TrackLinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Track the event
        trackAnalyticsEvent(businessId, eventType)

        // Execute original onClick if provided
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <a onClick={handleClick} {...props}>
            {children}
        </a>
    )
}
