'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
      router.push('/dashboard');
    } catch {
      setError('Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #E8EFE5 0%, #FAFAF6 60%, #F2F4EE 100%)' }}
    >
      <div
        style={{
          position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.08) 0%, transparent 70%)',
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
                background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: '#FAFAF6',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 2px 8px rgba(46,125,50,0.25)',
              }}
            >
              F
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#12160F' }}>
              FLUETAS
            </span>
          </div>
          <p style={{ color: '#586151', fontSize: '0.875rem' }}>Your Body. Your Data. Your Formula.</p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(18, 22, 15, 0.12)',
            borderRadius: 16,
            padding: '32px',
            boxShadow: '0 4px 20px rgba(18, 22, 15, 0.05)',
          }}
        >
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#12160F', marginBottom: 8 }}>
            Create your account
          </h1>
          <p style={{ color: '#586151', fontSize: '0.875rem', marginBottom: 24 }}>
            Start your wellness journey with FLUETAS
          </p>

          <button
            id="google-signup-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              background: '#FFFFFF', border: '1px solid rgba(18, 22, 15, 0.15)',
              color: '#12160F', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, marginBottom: 20,
              boxShadow: '0 1px 3px rgba(18,22,15,0.05)',
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
            <div style={{ flex: 1, height: 1, background: 'rgba(18, 22, 15, 0.10)' }} />
            <span style={{ color: '#8A9482', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(18, 22, 15, 0.10)' }} />
          </div>

          <form onSubmit={handleSignup}>
            {[
              { id: 'signup-name', label: 'Full name', type: 'text', value: name, onChange: setName, placeholder: 'Yogesh Sharma' },
              { id: 'signup-email', label: 'Email address', type: 'email', value: email, onChange: setEmail, placeholder: 'you@example.com' },
              { id: 'signup-password', label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: '••••••••' },
            ].map(field => (
              <div key={field.id} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#586151', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  required
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    background: '#F2F4EE', border: '1px solid rgba(18, 22, 15, 0.15)',
                    color: '#12160F', fontSize: '0.875rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#DC2626', fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 18px' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#586151', fontSize: '0.8rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>

          <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(18,22,15,0.08)' }}>
            <Link href="/expert-register" style={{ color: '#2E6DA4', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
              Are you a doctor or trainer? Register as an Expert →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
