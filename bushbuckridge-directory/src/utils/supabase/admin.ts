import { createClient } from './server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is in admins table
    const { data: admin, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

    if (error || !admin) {
        // Not an admin, redirect to home
        redirect('/')
    }

    return user
}
