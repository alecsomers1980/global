import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import AdminLoginForm from './AdminLoginForm'

export default async function AdminLoginPage() {
    const pb = await createClient()
    const user = pb.authStore.model

    // If already logged in as admin, redirect to dashboard
    if (user?.is_admin) {
        redirect('/admin')
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40 px-4">
            <AdminLoginForm />
        </div>
    )
}
