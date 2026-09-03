'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import {
  Dumbbell,
  Activity,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const capabilities = [
  { label: 'TRAIN', icon: Dumbbell, desc: 'Progressive training splits' },
  { label: 'TRACK', icon: Activity, desc: 'Biometric & hydration telemetry' },
  { label: 'EXPERTS', icon: UserCheck, desc: 'Direct doctor consultations' },
  { label: 'HEALTH RECORD', icon: ShieldCheck, desc: 'Private clinical data vault' },
];

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /**
   * Authoritatively redirects the authenticated user based on their Firestore role.
   */
  async function handleRoleRedirect(uid: string) {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const userRole = snap.data()?.role;
          if (userRole === 'admin') {
            router.replace('/admin/dashboard');
            return;
          }
          if (userRole === 'expert' || userRole === 'doctor') {
            router.replace('/doctor/dashboard');
            return;
          }
        }
      } catch (err) {
        console.warn('[Login] Role check error, falling back to dashboard:', err);
      }
    }
    router.replace('/dashboard');
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmail(email.trim(), password);
      await handleRoleRedirect(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. For your security, please try again in a few minutes.');
      } else if (code === 'auth/invalid-email') {
        setError('Please provide a valid email address.');
      } else {
        setError(err?.message || 'Authentication failed. Please verify your connection and try again.');
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
      await handleRoleRedirect(cred.user.uid);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        // User closed popup; do not show scary red error
        setError('Sign-in cancelled. Click Continue with Google when ready.');
      } else if (code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  const anim = (delay = 0) =>
    shouldReduceMotion
      ? { initial: { opacity: 0, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#FAFAF6] overflow-x-hidden p-4 sm:p-6 lg:p-12">
      {/* ── Background Organic Atmosphere ──────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full opacity-40 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(46,125,50,0.12) 0%, rgba(46,125,50,0.02) 65%, transparent 100%)',
            animationDuration: '9s',
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(122,78,158,0.08) 0%, rgba(46,109,164,0.03) 70%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(#12160F 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ── Main Two-Column Layout ───────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* ── LEFT COLUMN: Brand Statement & Capabilities ───────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          {/* Logo & Brand Name */}
          <motion.div {...anim(0.05)} className="flex items-center gap-3 mb-6 sm:mb-8">
            <Link
              href="/"
              className="flex items-center gap-3 no-underline group focus-visible:outline-2 focus-visible:outline-[#2E7D32] rounded-xl"
              aria-label="FLUETAS Homepage"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 relative rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/assets/image.png"
                  alt="FLUETAS Panther Symbol"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#12160F] tracking-wider leading-none">
                  FLUETAS
                </span>
                <span className="text-[0.625rem] tracking-[0.18em] text-[#586151] uppercase font-semibold mt-0.5">
                  Health &amp; Performance
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Primary Statement */}
          <motion.div {...anim(0.12)} className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 mb-3">
              <Sparkles size={12} />
              <span>CONNECTED HEALTH ARCHITECTURE</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-[#12160F] tracking-tight leading-[1.08] m-0">
              YOUR BODY.<br />
              YOUR DATA.<br />
              <span className="text-[#2E7D32]">YOUR FORMULA.</span>
            </h1>
          </motion.div>

          {/* Supporting Message */}
          <motion.p
            {...anim(0.2)}
            className="text-sm sm:text-base text-[#586151] leading-relaxed max-w-lg mt-4 mb-6 sm:mb-8"
          >
            A connected platform for your health, fitness and wellness journey.
            Zero manufactured statistics. Absolute biometric sovereignty.
          </motion.p>

          {/* Capability Badges */}
          <motion.div {...anim(0.28)} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.label}
                  className="bg-white/80 backdrop-blur-xs border border-[rgba(18,22,15,0.08)] rounded-xl p-3 flex flex-col gap-1.5 shadow-2xs hover:border-[#2E7D32]/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
                    <Icon size={13} />
                  </div>
                  <span className="font-['Outfit'] font-black text-xs text-[#12160F] tracking-wider">
                    {cap.label}
                  </span>
                  <span className="text-[0.65rem] text-[#586151] leading-tight">
                    {cap.desc}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN: Authentication Interface ────────────────────── */}
        <motion.div
          {...anim(0.18)}
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          <div className="bg-white border border-[rgba(18,22,15,0.10)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative">
            {/* Header */}
            <div className="mb-6">
              <h2 className="font-['Outfit'] text-2xl sm:text-[1.75rem] font-bold text-[#12160F] tracking-tight m-0">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-[#586151] mt-1 m-0">
                Sign in to your FLUETAS account
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-3.5 mb-5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold flex items-start gap-2.5 animate-slide-up"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white border border-[rgba(18,22,15,0.15)] hover:border-[rgba(18,22,15,0.30)] hover:bg-[#FAFAF6] text-[#12160F] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#2E7D32]"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#2E7D32]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0" aria-hidden="true">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[rgba(18,22,15,0.08)]" />
              <span className="text-[0.6875rem] font-bold text-[#8A9482] uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-[rgba(18,22,15,0.08)]" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-[#12160F] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[rgba(18,22,15,0.15)] focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] text-xs sm:text-sm text-[#12160F] bg-white transition-all outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-[#12160F]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading || googleLoading}
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 rounded-xl border border-[rgba(18,22,15,0.15)] focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] text-xs sm:text-sm text-[#12160F] bg-white transition-all outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9482] hover:text-[#12160F] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#2E7D32] hover:bg-[#256628] text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#2E7D32]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Secondary Account Actions */}
            <div className="mt-6 pt-5 border-t border-[rgba(18,22,15,0.08)] flex flex-col gap-3 text-center">
              <p className="text-xs text-[#586151] m-0">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-[#2E7D32] hover:underline no-underline focus-visible:outline-2 focus-visible:outline-[#2E7D32] rounded"
                >
                  Create your account
                </Link>
              </p>

              {/* Expert Registration Link */}
              <div className="p-3 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] flex items-center justify-between text-left gap-2">
                <div>
                  <p className="text-xs font-bold text-[#12160F] m-0">
                    Practitioner or Trainer?
                  </p>
                  <p className="text-[0.6875rem] text-[#586151] m-0">
                    Apply for verified clinical &amp; coaching access
                  </p>
                </div>
                <Link
                  href="/expert-register"
                  className="text-xs font-bold text-[#2E7D32] hover:text-[#256628] flex items-center gap-1 shrink-0 no-underline hover:underline"
                >
                  <span>Join as Expert</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
