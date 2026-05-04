'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export default function PaymentStatus({ status }: { status: string | null }) {
  useEffect(() => {
    if (!status) return

    switch (status) {
      case 'success':
        toast.success('Payment successful! Your listing is now active.', { duration: 8000 })
        break
      case 'failed':
        toast.error('Payment was not completed. Please try again or contact support.', { duration: 10000 })
        break
      case 'cancelled':
        toast.info('Payment was cancelled. You can try again when ready.', { duration: 6000 })
        break
      case 'pending':
        toast.info('Payment is being processed. We will notify you once confirmed.', { duration: 8000 })
        break
      case 'error':
        toast.error('Something went wrong with payment processing. Please contact support.', { duration: 10000 })
        break
    }
  }, [status])

  return null
}
