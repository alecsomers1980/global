'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .admin-login-bg {
          min-height: 100vh;
          background: #0c1f0e;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22,78,36,0.35), transparent),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(196,164,89,0.12), transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
        }

        .login-logo-area {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(196,164,89,0.12);
          border: 1px solid rgba(196,164,89,0.3);
          color: #c4a459;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 50px;
          margin-bottom: 24px;
        }

        .login-badge-dot {
          width: 6px;
          height: 6px;
          background: #c4a459;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .login-form-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 44px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(196,164,89,0.06),
            0 40px 80px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .login-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 36px;
        }

        .form-group { margin-bottom: 22px; }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 1px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .input-wrapper { position: relative; }

        .form-input {
          width: 100%;
          padding: 15px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #fff;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.25s;
          -webkit-text-fill-color: #fff;
        }

        .form-input::placeholder { color: #4b5563; }

        .form-input:focus {
          border-color: rgba(196,164,89,0.5);
          background: rgba(196,164,89,0.04);
          box-shadow: 0 0 0 3px rgba(196,164,89,0.1);
        }

        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          transition: color 0.2s;
          line-height: 1;
        }
        .pw-toggle:hover { color: #c4a459; }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #164e24, #1a6b2e);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(196,164,89,0.2);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 24px rgba(22,78,36,0.4);
          letter-spacing: 0.5px;
          margin-top: 8px;
        }

        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1a6b2e, #1e8035);
          box-shadow: 0 6px 32px rgba(22,78,36,0.6), 0 0 0 1px rgba(196,164,89,0.3);
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-footer {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-link {
          color: #4b5563;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .back-link:hover { color: #c4a459; }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-size: 12px;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="grid-overlay" />

      <div className="login-card">
        <div className="login-logo-area">
          <div className="login-badge">
            <span className="login-badge-dot" />
            Admin Portal
          </div>
          <Image
            src="/images/logo_t.png"
            alt="Riverview Preparatory School"
            width={100}
            height={100}
            style={{ objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'brightness(0) invert(1)' }}
            priority
          />
        </div>

        <div className="login-form-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to the Riverview Admin Portal</p>

          {error && (
            <div className="error-box">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-username">Username</label>
              <div className="input-wrapper">
                <input
                  id="admin-username"
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <div className="input-wrapper">
                <input
                  id="admin-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '48px' }}
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <><span className="spinner" />Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="back-link">
              ← Back to Website
            </Link>
            <div className="secure-badge">
              <span style={{ color: '#c4a459' }}>🔒</span>
              <span>Secure access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
