'use client';
import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ClientRegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true);
        setError('');
        const supabase = createClientSupabase();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ color: '#2d2d2d', margin: '0 0 12px 0' }}>Registration Successful!</h2>
                    <p style={{ color: '#6b7280', marginBottom: '28px' }}>Please check your email to confirm your account, then log in to access the upload portal.</p>
                    <Link href="/portal/login" style={{ display: 'inline-block', background: '#84cc16', color: '#2d2d2d', fontWeight: 700, padding: '12px 28px', borderRadius: '8px', textDecoration: 'none' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '440px', width: '100%' }}>
                <div style={{ background: '#2d2d2d', borderRadius: '12px 12px 0 0', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#84cc16', letterSpacing: '2px', fontFamily: 'Segoe UI, sans-serif' }}>ALOE SIGNS</div>
                    <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '14px' }}>Client Upload Portal</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: '#2d2d2d' }}>Create Account</h1>
                    <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: '#6b7280' }}>
                        Already registered?{' '}
                        <Link href="/portal/login" style={{ color: '#84cc16', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        {[
                            { label: 'Full Name', type: 'text', val: name, set: setName, ph: 'Your Name' },
                            { label: 'Email Address', type: 'email', val: email, set: setEmail, ph: 'client@example.com' },
                            { label: 'Password (min 8 chars)', type: 'password', val: password, set: setPassword, ph: '••••••••' },
                            { label: 'Confirm Password', type: 'password', val: confirm, set: setConfirm, ph: '••••••••' },
                        ].map(field => (
                            <div key={field.label}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                                <input
                                    type={field.type} required value={field.val}
                                    onChange={e => field.set(e.target.value)}
                                    placeholder={field.ph}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>
                        ))}
                        <button
                            type="submit" disabled={loading}
                            style={{ width: '100%', padding: '14px', background: loading ? '#a3d65a' : '#84cc16', color: '#2d2d2d', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '8px' }}
                        >
                            {loading ? 'Creating account…' : 'Create Account →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
