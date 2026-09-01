'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #0B0D14 50%, #07080E 100%)' }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: '-10%', right: '-5%', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: 'white',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              F
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#E8EAF6' }}>
              FLUETAS
            </span>
          </div>
          <p style={{ color: '#8B91B0', fontSize: '0.875rem' }}>Your Body. Your Data. Your Formula.</p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#13161F',
            border: '1px solid #1E2133',
            borderRadius: 16,
            padding: '32px',
          }}
        >
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#E8EAF6', marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: '#8B91B0', fontSize: '0.875rem', marginBottom: 24 }}>
            Sign in to your FLUETAS account
          </p>

          {/* Google button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              background: '#1E2133', border: '1px solid #2A3050',
              color: '#E8EAF6', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, marginBottom: 20,
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#1E2133' }} />
            <span style={{ color: '#3A3F58', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#1E2133' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8B91B0', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#0B0D14', border: '1px solid #1E2133',
                  color: '#E8EAF6', fontSize: '0.875rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#8B91B0', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#0B0D14', border: '1px solid #1E2133',
                  color: '#E8EAF6', fontSize: '0.875rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#F87171', fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 18px' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#8B91B0', fontSize: '0.8rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
