import type { Metadata } from 'next';
import { signRenderToken } from '@/lib/artwork/antibot';
import ArtworkUploadForm from '@/components/artwork/ArtworkUploadForm';

// The render token is minted per request, so it can never be cached or guessed.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Upload Artwork | Aloe Signs',
    description:
        'Send your artwork to Aloe Signs. No account needed — attach your files, tell us what you need, and our team will be in touch.',
};

export default function ArtworkPage() {
    return (
        <main className="min-h-screen bg-[#0B0E0D] pt-32 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                    Upload Artwork
                </h1>
                <p className="text-white/60 text-lg mb-4">
                    No account needed. Attach your files, tell us what you need, and our team
                    will come back to you.
                </p>
                <p className="text-white/40 text-sm mb-10">
                    Prefer to talk first? Call{' '}
                    <a href="tel:0116932600" className="text-aloe-green font-semibold">011 693 2600</a>.
                </p>
                <ArtworkUploadForm token={signRenderToken()} />
            </div>
        </main>
    );
}
