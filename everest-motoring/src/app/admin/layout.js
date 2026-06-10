import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import VideoRenderManager from "@/components/VideoRenderManager";

// Server Actions inherit the route segment config of the page that
// dispatches them. The AI walkaround pipeline (ai_actions.js) runs the
// longest chain — ingestMuxAction calls Cloudflare's enableDownloads which
// polls for up to 180s waiting for MP4 generation. 300s (the Pro plan
// ceiling) gives that headroom without risking platform-level rejection.
// pollSingleClipAction's ~30s worst case (Kie poll + ElevenLabs TTS +
// Fal mux) also benefits from the larger budget on slow days.
export const maxDuration = 300;

export default async function AdminLayout({ children }) {
    console.log("=== ADMIN LAYOUT HIT ===");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log("Redirecting to /login because no user found in session.");
        return redirect("/login");
    }

    console.log("Logged in user:", user.email, user.id);

    const { createAdminClient } = await import("@/utils/supabase/server");
    const supabaseAdmin = await createAdminClient();

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    console.log("Profile lookup:", profile, "Error:", error);

    if (!profile || profile.role !== 'admin') {
        console.log("Redirecting to /login because profile is null or role is not admin.");
        return redirect("/login?error=You+must+be+logged+in+as+an+Admin+to+access+this+dashboard.");
    }

    console.log("User authorized, rendering admin layout.");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            {/* Unified Admin Header */}
            <div 
                className="w-full px-6 py-6 flex justify-between items-center text-white border-b border-primary/30 relative z-30 shadow-2xl"
                style={{ background: '#000000', backgroundColor: '#000000' }}
            >
                <div className="flex items-center gap-10 relative z-10">
                    <a href="/admin/inventory" className="font-black text-3xl tracking-tighter hover:scale-105 transition-transform">EVEREST<span className="text-primary">ADMIN</span></a>
                    <nav className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em]">
                        <a href="/admin" className="text-white hover:text-primary transition-all">Dashboard</a>
                        <a href="/admin/inventory" className="text-slate-400 hover:text-white transition-all">Inventory</a>
                        <a href="/admin/news" className="text-slate-400 hover:text-white transition-all">News</a>
                        <a href="/admin/leads" className="text-slate-400 hover:text-white transition-all">Car Inquiries</a>
                        <a href="/admin/trade-ins" className="text-slate-400 hover:text-white transition-all">Trade-In Requests</a>
                        <a href="/admin/email-templates" className="text-slate-400 hover:text-white transition-all">Email Templates</a>
                        <a href="/admin/subscribers" className="text-slate-400 hover:text-white transition-all">Subscribers</a>
                        <a href="/admin/reports" className="text-slate-400 hover:text-white transition-all">Reports</a>
                        <a href="/admin/affiliates" className="text-amber-500 hover:text-amber-400 transition-all border-l border-slate-800 pl-8 ml-2">Affiliate Network</a>
                    </nav>
                </div>
                <div className="text-sm font-medium flex gap-4 items-center relative z-10">
                    <a href="/admin/profile" className="text-slate-400 hover:text-white transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        My Profile
                    </a>
                    <a href="/" className="text-slate-400 hover:text-white transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <span className="material-symbols-outlined text-[18px]">public</span>
                        View Site
                    </a>
                </div>
            </div>

            {/* Page Content */}
            <main className="flex-1 w-full flex flex-col relative z-10">
                {children}
            </main>

            <VideoRenderManager />
        </div>
    );
}

