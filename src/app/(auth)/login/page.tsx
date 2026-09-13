'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { signInWithEmail, signInWithGoogle, signOut, createCustomerProfileIfNew } from '@/lib/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Eye,
  EyeOff,
  Dumbbell,
  HeartPulse,
  Stethoscope,
  Activity,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  User,
  Shield,
} from 'lucide-react';

type LoginIntent = 'customer' | 'practitioner';

const capabilities = [
  { label: 'TRAIN', desc: 'Deterministic plans & biomechanics', icon: Dumbbell },
  { label: 'TRACK', desc: 'Hydration, sleep & nutrition logs', icon: Activity },
  { label: 'EXPERTS', desc: 'Verified clinical consultations', icon: Stethoscope },
  { label: 'HEALTH RECORD', desc: 'Sovereign encrypted timeline', icon: HeartPulse },
];

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [loginIntent, setLoginIntent] = useState<LoginIntent>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load saved credentials for 1-time / 1-click login on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedEmail = localStorage.getItem('fluetas_saved_email');
        const storedIntent = localStorage.getItem('fluetas_saved_intent') as LoginIntent | null;
        const storedRemember = localStorage.getItem('fluetas_remember_me');

        if (storedEmail) {
          setEmail(storedEmail);
          setSavedEmail(storedEmail);
        }
        if (storedIntent && ['customer', 'practitioner'].includes(storedIntent)) {
          setLoginIntent(storedIntent);
        }
        if (storedRemember !== null) {
          setRememberMe(storedRemember === 'true');
        }
      } catch {}
    }
  }, []);

  /**
   * Authoritatively validates the authenticated user's role against their selected login intent.
   * If credentials do not match the intent, immediately signs out and surfaces an explicit error.
   */
  async function validateAndRedirectRole(firebaseUser: { uid: string }, intent: LoginIntent) {
    if (!db) {
      router.replace(intent === 'practitioner' ? '/doctor/dashboard' : '/dashboard');
      return;
    }

    // Persist or clear sign-in details according to rememberMe preference
    if (typeof window !== 'undefined') {
      try {
        if (rememberMe && email.trim()) {
          localStorage.setItem('fluetas_saved_email', email.trim());
          localStorage.setItem('fluetas_saved_intent', intent);
          localStorage.setItem('fluetas_remember_me', 'true');
        } else if (!rememberMe) {
          localStorage.removeItem('fluetas_saved_email');
          localStorage.removeItem('fluetas_saved_intent');
          localStorage.setItem('fluetas_remember_me', 'false');
        }
      } catch {}
    }

    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));

      // 1. New Google user or missing profile
      if (!snap.exists()) {
        if (intent === 'customer') {
          // Provision customer document
          await createCustomerProfileIfNew(firebaseUser as any);
          router.replace('/dashboard');
          return;
        } else {
          // Reject practitioner login without registered credentials
          await signOut();
          setError('No practitioner profile found for this account. Please submit your clinical credentials via Practitioner Registration.');
          return;
        }
      }

      const userData = snap.data();
      const rawRole = userData?.role ? String(userData.role).toLowerCase() : 'customer';
      const rawStatus = userData?.status ? String(userData.status).toLowerCase() : 'active';

      // 2. Suspended account gate
      if (rawStatus === 'suspended') {
        await signOut();
        setError('Your account is currently suspended. Please reach out to support@fluetas.com.');
        return;
      }

      // 3. Strict Role Matching against Login Intent
      if (intent === 'customer') {
        if (rawRole === 'customer') {
          router.replace('/dashboard');
          return;
        }
        if (rawRole === 'expert' || rawRole === 'doctor') {
          await signOut();
          setError('This account is registered as a practitioner. Please select Practitioner login.');
          return;
        }
        if (rawRole === 'admin') {
          await signOut();
          setError('This account has administrator privileges. Please use the Admin Portal at /admin/login.');
          return;
        }
      } else if (intent === 'practitioner') {
        if (rawRole === 'expert' || rawRole === 'doctor') {
          router.replace('/doctor/dashboard');
          return;
        }
        if (rawRole === 'customer') {
          await signOut();
          setError('These credentials are registered as a customer account. Practitioner access is not available.');
          return;
        }
        if (rawRole === 'admin') {
          await signOut();
          setError('This account has administrator privileges. Please use the Admin Portal at /admin/login.');
          return;
        }
      }

      // Fallback
      await signOut();
      setError('Unrecognized account authorization. Please contact support.');
    } catch (err: any) {
      console.error('[Login] Authorization validation error:', err);
      await signOut();
      setError('Unable to verify account authorization. Please try again.');
    }
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
      await validateAndRedirectRole(cred.user, loginIntent);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
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
      await validateAndRedirectRole(cred.user, loginIntent);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-surface overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
      {/* ── Background Organic Atmosphere ──────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full opacity-40 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(42,125,48,0.12) 0%, rgba(42,125,48,0.02) 65%, transparent 100%)',
            animationDuration: '9s',
          }}
        />
        <div
          className="absolute -bottom-[15%] -right-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(112,72,160,0.07) 0%, rgba(37,101,160,0.02) 70%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(var(--ink) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ── Main Two-Column Layout ───────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
        {/* ── LEFT COLUMN: Brand Statement & Capabilities ───────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left py-2 lg:py-6">
          {/* Logo & Brand Name */}
          <motion.div {...anim(0.05)} className="flex items-center gap-3.5 mb-6 sm:mb-8">
            <Link
              href="/"
              className="flex items-center gap-3.5 no-underline group focus-visible:outline-2 focus-visible:outline-leaf rounded-xl"
              aria-label="FLUETAS Homepage"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 relative rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/assets/image.png"
                  alt="FLUETAS Panther Symbol"
                  width={52}
                  height={52}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl sm:text-3xl lg:text-3xl font-bold text-ink tracking-wider leading-none">
                  FLUETAS
                </span>
                <span className="text-[0.65rem] sm:text-xs tracking-[0.2em] text-ink-subtle uppercase font-semibold mt-1">
                  Health &amp; Performance
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Primary Statement */}
          <motion.div {...anim(0.12)} className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-leaf-dim text-leaf border border-leaf/15 mb-3">
              <Sparkles size={12} />
              <span>CONNECTED HEALTH ARCHITECTURE</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-ink tracking-tight leading-[1.05] m-0">
              YOUR BODY.<br />
              YOUR DATA.<br />
              <span className="text-leaf">YOUR FORMULA.</span>
            </h1>
          </motion.div>

          {/* Supporting Message */}
          <motion.p
            {...anim(0.2)}
            className="text-sm sm:text-base lg:text-lg text-ink-soft leading-relaxed max-w-xl mt-4 mb-6 sm:mb-8"
          >
            A connected platform for your health, fitness and wellness journey.
            Zero manufactured statistics. Absolute biometric sovereignty.
          </motion.p>

          {/* Capability Badges */}
          <motion.div {...anim(0.28)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.label}
                  className="bg-card/85 backdrop-blur-sm border border-rule rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1.5 shadow-xs hover:border-leaf/25 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-leaf-dim text-leaf flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  <span className="font-heading font-bold text-xs sm:text-sm text-ink tracking-wider">
                    {cap.label}
                  </span>
                  <span className="text-[0.6875rem] text-ink-soft leading-tight">
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
          className="lg:col-span-5 w-full max-w-md lg:max-w-[460px] xl:max-w-[480px] mx-auto lg:ml-auto"
        >
          <div className="bg-card border border-rule rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm relative">
            {/* Header */}
            <div className="mb-5">
              <h2 className="font-heading text-2xl sm:text-[1.85rem] font-bold text-ink tracking-tight m-0">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-1 m-0">
                Sign in to your FLUETAS account
              </p>
            </div>

            {/* Account Type Selector (Intent) */}
            <div className="mb-5">
              <label className="block text-[0.6875rem] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                Who are you?
              </label>
              <div className="grid grid-cols-2 p-1 bg-surface-2 rounded-xl border border-rule">
                <button
                  type="button"
                  id="intent-customer-btn"
                  onClick={() => { setLoginIntent('customer'); setError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginIntent === 'customer'
                      ? 'bg-card text-ink shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <User size={13} />
                  <span>Customer</span>
                </button>
                <button
                  type="button"
                  id="intent-practitioner-btn"
                  onClick={() => { setLoginIntent('practitioner'); setError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginIntent === 'practitioner'
                      ? 'bg-card text-ink shadow-xs'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Stethoscope size={13} />
                  <span>Practitioner</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5 animate-slide-up"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-card border border-rule hover:border-ink-muted hover:bg-surface text-ink text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-leaf"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-leaf" />
                  <span>Verifying authorization...</span>
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
              <div className="flex-1 h-px bg-rule" />
              <span className="text-[0.6875rem] font-bold text-ink-muted uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-rule" />
            </div>

            {/* Saved Account Chip for 1-Click Login */}
            {savedEmail && (
              <div className="mb-4 p-2.5 bg-leaf/5 border border-leaf/15 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-leaf" />
                  <span className="text-ink-soft truncate">Saved account: <strong className="text-ink">{savedEmail}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(savedEmail);
                  }}
                  className="text-[0.68rem] font-bold text-leaf hover:underline shrink-0 cursor-pointer"
                >
                  Autofill
                </button>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-ink mb-1.5"
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
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-ink"
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
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me / 1-Time Login Option */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-leaf focus:ring-leaf accent-leaf cursor-pointer"
                  />
                  <span className="text-ink-soft font-medium text-[0.75rem]">
                    Save sign-in details for 1-time login
                  </span>
                </label>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading || googleLoading}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-leaf hover:bg-leaf-hi text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-leaf"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In as {loginIntent === 'practitioner' ? 'Practitioner' : 'Customer'}</span>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-6 pt-5 border-t border-rule flex flex-col gap-3">
              <p className="text-xs text-ink-soft m-0 text-center">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-leaf hover:text-leaf-hi transition-colors no-underline hover:underline"
                >
                  Sign Up
                </Link>
              </p>

              {/* Expert Registration Link */}
              <div className="p-3 rounded-xl bg-surface border border-rule flex items-center justify-between text-left gap-2">
                <div>
                  <p className="text-xs font-bold text-ink m-0">
                    Practitioner or Trainer?
                  </p>
                  <p className="text-[0.6875rem] text-ink-subtle m-0">
                    Apply for verified clinical &amp; coaching access
                  </p>
                </div>
                <Link
                  href="/expert-register"
                  className="text-xs font-bold text-leaf hover:text-leaf-hi flex items-center gap-1 shrink-0 no-underline hover:underline"
                >
                  <span>Join as Expert</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Admin Portal Discretionary Link */}
              <div className="text-center pt-1">
                <Link
                  href="/admin/login"
                  className="text-[0.6875rem] font-semibold text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1 no-underline"
                >
                  <Shield size={12} /> Platform Administrator? Access Admin Portal →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
