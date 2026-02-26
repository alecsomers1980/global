'use client';
import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PortalLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const supabase = createClientSupabase();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
        router.push('/portal/');
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Image src="/aloe-logo.png" alt="Aloe Signs" width={200} height={66} style={{ objectFit: 'contain', margin: '0 auto' }} />
                    <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '14px' }}>Sign in to your client portal</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
                    <button type="submit" disabled={loading}
                        style={{ width: '100%', padding: '14px', background: '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    Don&apos;t have an account? <Link href="/portal/register" style={{ color: '#84cc16', fontWeight: 600 }}>Register</Link>
                </p>
            </div>
        </div>
    );
}
