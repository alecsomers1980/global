'use client';
import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PortalRegister() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [company, setCompany] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!contactNumber.trim()) { setError('Contact number is required.'); return; }
        setError('');
        setLoading(true);
        const supabase = createClientSupabase();
        const { error: signUpError } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName, company, contact_number: contactNumber } },
        });
        if (signUpError) { setError(signUpError.message); setLoading(false); return; }
        setSuccess(true);
    }

    const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ margin: '0 0 12px 0', color: '#2d2d2d' }}>Check your email</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>We&apos;ve sent a confirmation link to <strong>{email}</strong></p>
                    <button onClick={() => router.push('/portal/login')}
                        style={{ background: '#84cc16', color: '#1a1a1a', fontWeight: 700, padding: '12px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px' }}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Image src="/aloe-logo.png" alt="Aloe Signs" width={200} height={66} style={{ objectFit: 'contain', margin: '0 auto' }} />
                    <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '14px' }}>Create your client portal account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Full Name *</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} /></div>
                    <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} /></div>
                    <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Password *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} /></div>
                    <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Company <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label><input type="text" value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} /></div>
                    <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Contact Number *</label><input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required placeholder="+27..." style={inputStyle} /></div>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
                    <button type="submit" disabled={loading}
                        style={{ width: '100%', padding: '14px', background: '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    Already have an account? <Link href="/portal/login" style={{ color: '#84cc16', fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
