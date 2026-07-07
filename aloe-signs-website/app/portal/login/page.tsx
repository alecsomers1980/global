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
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const supabase = createClientSupabase();

        if (isForgotPassword) {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/portal/reset-password`,
            });
            if (resetError) {
                setError(resetError.message);
            } else {
                setResetSent(true);
            }
            setLoading(false);
            return;
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
        const userEmail = data.user?.email;

        // Save remember preference if needed (e.g. for re-populating or logging)
        if (rememberMe) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('remember_me', 'true');
            }
        }

        if (userEmail === 'view@aloesigns.co.za') {
            router.push('/');
        } else if (data.user?.app_metadata?.role || userEmail?.endsWith('@aloesigns.co.za') || userEmail?.startsWith('info@') || userEmail === 'admin@rvr.co.za') {
            router.push('/portal/admin');
        } else {
            router.push('/portal/');
        }
    }

    return (
        <div className="portal-wrapper">


            <div className="portal-login-bg">
                <div className="grid-overlay" />

                <div className="login-card">
                    <div className="login-logo-area">
                        <div className="login-badge">
                            <span className="login-badge-dot" />
                            Portal Access
                        </div>
                        <Image
                            src="/aloe-logo.png"
                            alt="Aloe Signs"
                            width={140}
                            height={46}
                            style={{ objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'brightness(0) invert(1)' }}
                        />
                    </div>

                    <div className="login-form-card">
                        <h1 className="login-title">
                            {isForgotPassword ? 'Reset Password' : 'Client Login'}
                        </h1>
                        <p className="login-subtitle">
                            {isForgotPassword 
                                ? 'Enter your email to receive a password reset link' 
                                : 'Sign in to access your secure client portal'}
                        </p>

                        {error && (
                            <div className="error-box">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        {resetSent && (
                            <div className="success-box">
                                <span>✓</span> Reset link sent! Check your email.
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        id="email"
                                        className="form-input"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="password">Password</label>
                                        <div className="input-wrapper">
                                            <input
                                                id="password"
                                                className="form-input"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                                autoComplete="current-password"
                                                style={{ paddingRight: '44px' }}
                                            />
                                            <button
                                                type="button"
                                                className="pw-toggle"
                                                onClick={() => setShowPassword(p => !p)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? '🙈' : '👁'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-options">
                                        <label className="remember-me">
                                            <input 
                                                type="checkbox" 
                                                checked={rememberMe}
                                                onChange={e => setRememberMe(e.target.checked)}
                                            />
                                            Keep me logged in
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsForgotPassword(true)}
                                            className="forgot-link"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner" />Processing…</>
                                ) : isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                            </button>
                        </form>

                        {isForgotPassword && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <button 
                                    onClick={() => { setIsForgotPassword(false); setError(''); setResetSent(false); }}
                                    className="forgot-link"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        )}

                        <div className="login-footer">
                            <Link href="/" className="back-link">
                                ← Back to Website
                            </Link>
                            <div className="secure-badge">
                                <span style={{ color: '#84cc16' }}>🔒</span>
                                <span style={{ color: '#6b7280' }}>Secure access</span>
                            </div>
                        </div>

                        {!isForgotPassword && (
                            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                                Don&apos;t have an account? <Link href="/portal/register" style={{ color: '#84cc16', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
