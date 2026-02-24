import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import VideoRenderManager from "@/components/VideoRenderManager";

export default async function AdminLayout({ children }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Unified Admin Header */}
            <div className="w-full bg-slate-900 px-6 py-4 flex justify-between items-center text-white border-b-4 border-primary">
                <div className="flex items-center gap-8">
                    <a href="/admin/inventory" className="font-bold text-xl tracking-wider">EVEREST<span className="text-primary">ADMIN</span></a>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <a href="/admin" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
                        <a href="/admin/inventory" className="text-slate-300 hover:text-white transition-colors">Inventory</a>
                        <a href="/admin/leads" className="text-slate-300 hover:text-white transition-colors">Car Inquiries</a>
                        <a href="/admin/trade-ins" className="text-slate-300 hover:text-white transition-colors">Trade-In Requests</a>
                        <a href="/admin/affiliates" className="text-amber-500 hover:text-amber-400 font-bold transition-colors border-l border-slate-700 pl-6 ml-2">Affiliate Network</a>
                    </nav>
                </div>
                <div className="text-sm font-medium flex gap-4 items-center">
                    <a href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">public</span>
                        View Site
                    </a>
                </div>
            </div>

            {/* Page Content */}
            <main className="flex-1 w-full flex flex-col">
                {children}
            </main>

            <VideoRenderManager />
        </div>
    );
}
