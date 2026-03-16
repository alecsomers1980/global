'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';
import { Palette, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function AdminHubPage() {
    const router = useRouter();

    async function handleSignOut() {
        const supabase = createClientSupabase();
        await supabase.auth.signOut();
        router.push('/portal/login');
    }

    return (
        <div className="min-h-[100dvh] bg-[#f3f4f6] font-outfit">
            {/* Header */}
            <div className="bg-[#2d2d2d] py-5">
                <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} className="object-contain" />
                        <span className="text-amber-500 text-[13px] font-bold border-l border-gray-600 pl-4">⚙️ Admin Portal</span>
                    </div>
                    <button onClick={handleSignOut} className="bg-transparent border border-gray-500 text-gray-400 py-2 px-4 rounded-md cursor-pointer text-[13px] hover:text-white hover:border-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-[#2d2d2d] mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500">Select a module to manage production.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    {/* Artwork Portal */}
                    <Link
                        href="/portal/admin/artwork"
                        className="group p-8 bg-white rounded-[2rem] border border-gray-200 hover:border-aloe-green/50 hover:shadow-xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Palette size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                            Client Artwork
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Review client uploads, manage design proofs, and send sign-off emails.
                        </p>
                    </Link>

                    {/* Jobcards Portal */}
                    <Link
                        href="/portal/admin/jobcards"
                        className="group p-8 bg-white rounded-[2rem] border border-gray-200 hover:border-aloe-green/50 hover:shadow-xl transition-all duration-500 text-left relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                            Production Jobcards
                            <ArrowRight size={20} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Create, edit, and track physical processing of production job cards.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
