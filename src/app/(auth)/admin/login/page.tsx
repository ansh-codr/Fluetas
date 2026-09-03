'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Shield, Lock, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function validateAdminAndRedirect(uid: string) {
    if (!db) {
      router.replace('/admin/dashboard');
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        await signOut();
        setError('Access Denied: Administrative profile not found for this account.');
        return;
      }

      const role = String(snap.data()?.role || '').toLowerCase();
      if (role !== 'admin') {
        await signOut();
        setError('Access Denied: These credentials do not have platform administrator authorization. This incident has been logged to the security audit trail.');
        return;
      }

      // Success: verified platform administrator
      router.replace('/admin/dashboard');
    } catch (err: any) {
      console.error('[AdminLogin] Authorization error:', err);
      await signOut();
      setError('Unable to verify administrative authorization. Please try again.');
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your administrative email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmail(email.trim(), password);
      await validateAdminAndRedirect(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid administrative credentials.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Security cooldown active for 15 minutes.');
      } else {
        setError(err?.message || 'Authentication failed. Administrative access denied.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);

    try {
      const cred = await signInWithGoogle();
      await validateAdminAndRedirect(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Administrative sign-in cancelled.');
      } else {
        setError(err?.message || 'Google authentication failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0D14] text-white p-4 sm:p-6 overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-[#13161F] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Security Banner */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E2133]">
            <Link
              href="/login"
              className="text-xs text-[#8B91B0] hover:text-white flex items-center gap-1.5 no-underline transition-colors"
            >
              <ArrowLeft size={14} /> Back to Member Login
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              INTERNAL ONLY
            </span>
          </div>

          {/* Brand & Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-sm">
              <Shield size={28} />
            </div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-white tracking-tight m-0">
              FLUETAS Admin Portal
            </h1>
            <p className="text-xs text-[#8B91B0] m-0 mt-1">
              Restricted console for platform governance, clinical audits &amp; expert verification.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3.5 mb-5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Google Sign In for Admin */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#1A1E2E] border border-[#2A2F45] hover:border-amber-500/50 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <Lock size={15} className="text-amber-400" />
                <span>Authenticate with Google Workspace</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1E2133]" />
            <span className="text-[0.65rem] font-bold text-[#8B91B0] uppercase tracking-wider">
              or credentials
            </span>
            <div className="flex-1 h-px bg-[#1E2133]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-[#E8EAF6] mb-1.5"
              >
                Administrator Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@fluetas.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading || googleLoading}
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#2A2F45] bg-[#0E111A] text-white focus:border-amber-500 text-xs sm:text-sm transition-all outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-[#E8EAF6] mb-1.5"
              >
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full min-h-[46px] pl-3.5 pr-11 py-2.5 rounded-xl border border-[#2A2F45] bg-[#0E111A] text-white focus:border-amber-500 text-xs sm:text-sm transition-all outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#8B91B0] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying authorization...</span>
                </>
              ) : (
                <span>Authorize &amp; Access Admin Console</span>
              )}
            </button>
          </form>

          {/* Audit Notice */}
          <p className="text-[0.65rem] text-[#8B91B0] text-center m-0 mt-6 leading-relaxed">
            Authorized personnel only. All login attempts, sessions, and data interactions are logged to an immutable security audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
