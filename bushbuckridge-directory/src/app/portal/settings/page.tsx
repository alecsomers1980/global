import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function ClientSettingsPage() {
    const pb = await createClient()
    const user = pb.authStore.model

    if (!user) redirect('/login')

    let business: any = null
    try {
        business = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`)
    } catch (e) {
        redirect('/')
    }

    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ''

    return <SettingsForm business={business} pbUrl={pbUrl} />
}
