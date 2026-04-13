import { createClient } from './server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
    const pb = await createClient()

    if (!pb.authStore.isValid || !pb.authStore.model) {
        redirect('/login')
    }

    // Check if user has is_admin flag
    const user = pb.authStore.model;
    
    if (!user.is_admin) {
        // Not an admin, redirect to home
        redirect('/')
    }

    return user
}
