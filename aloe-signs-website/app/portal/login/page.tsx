'use client';
import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ClientLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const supabase = createClientSupabase();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            window.location.href = '/portal/upload';
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '440px', width: '100%' }}>
                {/* Header */}
                <div style={{ background: '#2d2d2d', borderRadius: '12px 12px 0 0', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#84cc16', letterSpacing: '2px', fontFamily: 'Segoe UI, sans-serif' }}>
                        ALOE SIGNS
                    </div>
                    <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '14px' }}>Client Upload Portal</p>
                </div>

                {/* Form Card */}
                <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: '#2d2d2d' }}>Sign In</h1>
                    <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: '#6b7280' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/portal/register" style={{ color: '#84cc16', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address</label>
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
                            placeholder="client@example.com"
                        />
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
                        <input
                            type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '24px', boxSizing: 'border-box', outline: 'none' }}
                            placeholder="••••••••"
                        />
                        <button
                            type="submit" disabled={loading}
                            style={{ width: '100%', padding: '14px', background: loading ? '#a3d65a' : '#84cc16', color: '#2d2d2d', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                        >
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
