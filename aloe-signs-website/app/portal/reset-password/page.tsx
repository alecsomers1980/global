'use client';
import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        const supabase = createClientSupabase();

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/portal/login');
            }, 3000);
        }
        setLoading(false);
    }

    return (
        <div className="portal-wrapper">

            <div className="portal-login-bg">
                <div className="grid-overlay" />

                <div className="login-card">
                    <div className="login-logo-area">
                        <div className="login-badge">
                            Reset Password
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
                        <h1 className="login-title">New Password</h1>
                        <p className="login-subtitle">Set your new account password</p>

                        {error && (
                            <div className="error-box">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        {success && (
                            <div className="success-box">
                                <span>✓</span> Password updated! Redirecting to login...
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">New Password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        className="form-input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        className="form-input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-btn" disabled={loading || success}>
                                {loading ? (
                                    <><span className="spinner" />Updating…</>
                                ) : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
