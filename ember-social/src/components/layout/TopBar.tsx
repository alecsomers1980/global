'use client'

import { createClient } from '@/lib/supabase/client-browser'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function TopBar({ user }: { user: SupabaseUser }) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="flex items-center justify-between px-6 py-3 shrink-0"
            style={{ borderBottom: '1px solid #1a1a27', background: '#0a0a0f' }}>

            {/* Left — breadcrumb slot (filled by page) */}
            <div id="topbar-breadcrumb" className="text-sm" style={{ color: '#5a5a7a' }} />

            {/* Right — actions */}
            <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: '#4a4a6a' }}>
                    <Bell className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid #1a1a27' }}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ background: 'rgba(249,115,22,0.15)' }}>
                        <User className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-medium text-white leading-none">{user.email?.split('@')[0]}</p>
                        <p className="text-[10px] leading-none mt-0.5" style={{ color: '#3a3a5a' }}>Admin</p>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-red-500/10 ml-1"
                        style={{ color: '#4a4a6a' }}
                        title="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    )
}
