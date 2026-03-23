import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: realUser } } = await supabase.auth.getUser()

    // Mock user for bypass mode
    const user = realUser || {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@ember-social.local',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
    } as any

    // Fetch workspaces for sidebar
    const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id, name, slug, logo_url')
        .order('name')

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
            <Sidebar workspaces={workspaces ?? []} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopBar user={user} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
