'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';
import { FileSpreadsheet, ArrowRight, Settings, Package, User, Users, ScrollText, Newspaper, FolderKanban, Inbox } from 'lucide-react';

export default function AdminHubPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadArtwork, setUnreadArtwork] = useState(0);

    useEffect(() => {
        createClientSupabase().auth.getUser().then(({ data }) => {
            const email = data.user?.email || '';
            const role = (data.user?.app_metadata as any)?.role;
            setIsAdmin(role === 'admin' || email === 'andre@aloesigns.co.za');
        });
    }, []);

    useEffect(() => {
        fetch('/api/portal/admin/artwork-uploads')
            .then(r => (r.ok ? r.json() : { unread: 0 }))
            .then(d => setUnreadArtwork(d.unread || 0))
            .catch(() => { });
    }, []);

    async function handleSignOut() {
        const supabase = createClientSupabase();
        await supabase.auth.signOut();
        router.push('/portal/login');
    }

    return (
        <div className="min-h-[100dvh] bg-transparent font-inter">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-md border-b border-white/5 py-5">
                <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} className="object-contain filter brightness-0 invert" />
                        <span className="text-[#84cc16] text-[13px] font-bold border-l border-white/10 pl-4">⚙️ Admin Portal</span>
                    </div>
                    <button onClick={handleSignOut} className="bg-transparent border border-white/20 text-gray-400 py-2 px-4 rounded-md cursor-pointer text-[13px] hover:text-white hover:border-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-extrabold text-white mb-2 letter-spacing-[-0.5px]">Admin Dashboard</h1>
                    <p className="text-gray-400 text-sm">Select a module to manage production workflows.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    {/* Public Artwork Uploads */}
                    <Link
                        href="/portal/admin/artwork-uploads"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        {unreadArtwork > 0 && (
                            <span className="absolute top-6 right-6 bg-[#84cc16] text-black text-xs font-black rounded-full min-w-[26px] h-[26px] px-2 flex items-center justify-center">
                                {unreadArtwork}
                            </span>
                        )}
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Inbox size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Artwork Uploads
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Public submissions from aloesigns.co.za/artwork. Files auto-delete 7 days after download.
                        </p>
                    </Link>

                    {/* Client Artwork tile hidden by request (2026-08-22). The page itself is
                        untouched and still reachable at /portal/admin/artwork — it holds the
                        registered-client uploads and the proof sign-off loop. Restore this block
                        to bring the tile back. */}

                    {/* Jobcards Portal */}
                    <Link
                        href="/portal/admin/jobcards"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Production Jobcards
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Create, edit, and track physical processing of production job cards.
                        </p>
                    </Link>

                    {/* Settings — admin only */}
                    {isAdmin && (
                    <Link
                        href="/portal/admin/settings"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Settings size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Settings
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Manage artwork rate, HP Latex prices and other pricing.
                        </p>
                    </Link>
                    )}

                    {/* News & Blog */}
                    <Link
                        href="/portal/admin/news"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Newspaper size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            News & Blog
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Review, approve and publish the AI-drafted blog articles created each month.
                        </p>
                    </Link>

                    {/* Projects */}
                    <Link
                        href="/portal/admin/projects"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FolderKanban size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Projects
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Showcase completed work — cinematic reels, galleries and SEO case studies.
                        </p>
                    </Link>

                    {/* Shop Products */}
                    <Link
                        href="/portal/admin/products"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Package size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Shop Products
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Add, edit and delete products in the online shop.
                        </p>
                    </Link>

                    {/* Profile — everyone */}
                    <Link
                        href="/portal/profile"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            My Profile
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Update your details and change your password.
                        </p>
                    </Link>

                    {/* Users — admin only */}
                    {isAdmin && (
                    <Link
                        href="/portal/admin/users"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Staff Users
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Create staff, set roles and reset passwords.
                        </p>
                    </Link>
                    )}

                    {/* Logs — admin only */}
                    {isAdmin && (
                    <Link
                        href="/portal/admin/logs"
                        className="group p-8 bg-white/3 backdrop-blur-md border border-white/10 hover:border-[#84cc16]/40 hover:bg-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ScrollText size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white group-hover:text-[#84cc16] transition-colors">
                            Activity Logs
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            See who did what and when — jobcards, site changes and sales.
                        </p>
                    </Link>
                    )}
                </div>
            </div>
        </div>
    );
}