import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const pb = await createClient()
  const user = pb.authStore.model

  if (!user) redirect('/login')

  let business: any = null
  let subscription: any = null
  let payments: any[] = []

  try {
    business = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`, {
      select: 'id,name,package_tier'
    })
    
    subscription = await pb.collection('subscriptions').getFirstListItem(`business = "${business.id}"`, {
      sort: '-created'
    })

    const paymentRecords = await pb.collection('payments').getList(1, 10, {
      filter: `business = "${business.id}"`,
      sort: '-created'
    })
    payments = paymentRecords.items
  } catch (e) {
    if (!business) redirect('/')
    // Subscription or payments might legitimately be missing
  }

  return (
    <BillingClient
      business={business}
      subscription={subscription}
      payments={payments}
    />
  )
}
