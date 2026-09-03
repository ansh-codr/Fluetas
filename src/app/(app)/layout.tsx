'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import DoctorTopBar from '@/components/layout/DoctorTopBar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopBar from '@/components/layout/AdminTopBar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import DevRoleSwitcher from '@/components/auth/DevRoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/config';
import { isHealthEngineReady, UserProfile, HealthProfile } from '@/lib/services/userService';
import { ShieldAlert, Stethoscope, Users } from 'lucide-react';

function ZeroFlashLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 relative">
          <Image
            src="/assets/image.png"
            alt="FLUETAS"
            width={48}
            height={48}
            priority
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <p className="font-['Outfit'] text-xs font-bold tracking-widest text-[#586151] uppercase m-0">
          Securing your session...
        </p>
        <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const { user, role, status, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isDoctorRoute = pathname.startsWith('/doctor') || pathname.startsWith('/expert');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = !isDoctorRoute && !isAdminRoute;

  const isPractitioner = role === 'doctor' || role === 'expert';
  const isCustomer = role === 'customer';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (loading) return;

    // 1. Not authenticated: redirect to appropriate login portal
    if (!user) {
      if (isAdminRoute) {
        router.replace('/admin/login');
      } else {
        router.replace('/login');
      }
      return;
    }

    // Role is still resolving: wait for resolution
    if (!role) return;

    // 2. Customer Onboarding Gate (Zero-Flash protection)
    if (isCustomer && isCustomerRoute) {
      if (pathname === '/onboarding') {
        setOnboardingChecked(true);
        return;
      }

      if (db) {
        Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'users', user.uid, 'healthProfile', 'main')),
        ])
          .then(([userSnap, healthSnap]) => {
            const uData = userSnap.exists() ? (userSnap.data() as UserProfile) : null;
            const hData = healthSnap.exists() ? (healthSnap.data() as HealthProfile) : null;

            const isComplete = uData?.onboardingComplete === true;
            const healthReady = isHealthEngineReady(uData, hData).ready;

            if (!isComplete || !healthReady) {
              router.replace('/onboarding');
            } else {
              setOnboardingChecked(true);
            }
          })
          .catch(() => {
            setOnboardingChecked(true);
          });
      } else {
        setOnboardingChecked(true);
      }
    } else {
      setOnboardingChecked(true);
    }
  }, [user, role, loading, router, pathname, isCustomerRoute, isCustomer, isAdminRoute]);

  // ── GATE 1: Session, Role & Onboarding Resolution ──────────────────────────
  // Mandatory Zero-Flash: NEVER render children or dashboard before auth, role & onboarding are fully resolved
  if (loading || !user || !role || !onboardingChecked) {
    return <ZeroFlashLoadingScreen />;
  }

  // ── GATE 2: Account Status Check ──────────────────────────────────────────
  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 border-red-500/30">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">Account Suspended</h2>
          <p className="text-xs text-[#586151] m-0 leading-relaxed">
            Your account has been temporarily suspended by platform administrators. Please contact support@fluetas.com to review your credentials.
          </p>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  // ── GATE 3: Explicit Wrong-Role Access States (Section 19 & 27 Requirements) ─
  // Display explicit role explanation and navigation instead of silent redirect loops or arbitrary navigation
  if (isCustomer && isDoctorRoute) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center text-2xl">
            <Stethoscope size={28} />
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">Practitioner Access Required</h2>
          <p className="text-xs text-[#586151] m-0 leading-relaxed">
            This clinical area is reserved for licensed doctors and verified wellness practitioners. If you are a practitioner, you can register your credentials with our Medical Board.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/dashboard"
              className="btn-primary bg-[#12160F] hover:bg-[#25201A] text-white text-xs px-4 py-2.5 rounded-xl no-underline"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/expert-register"
              className="px-4 py-2.5 rounded-xl border border-[rgba(18,22,15,0.12)] text-xs font-bold text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6] no-underline transition-colors"
            >
              Apply as Practitioner
            </Link>
          </div>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  if (!isAdmin && isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">Administrator Access Required</h2>
          <p className="text-xs text-[#586151] m-0 leading-relaxed">
            Your account does not have platform administration privileges. Administrative roles are server-authoritative and audited.
          </p>
          <div className="pt-2">
            <Link
              href={isPractitioner ? '/doctor/dashboard' : '/dashboard'}
              className="btn-primary bg-[#12160F] hover:bg-[#25201A] text-white text-xs px-5 py-2.5 rounded-xl no-underline"
            >
              Return to {isPractitioner ? 'Practitioner Portal' : 'Dashboard'}
            </Link>
          </div>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  if (isPractitioner && isCustomerRoute) {
    return (
      <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center text-2xl">
            <Users size={28} />
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">This Area is Available to Customer Accounts</h2>
          <p className="text-xs text-[#586151] m-0 leading-relaxed">
            You are currently logged in as a clinical practitioner. To access patient records, consultations, and medical review tools, use your practitioner portal.
          </p>
          <div className="pt-2">
            <Link
              href="/doctor/dashboard"
              className="btn-primary bg-[#2E6DA4] hover:bg-[#255885] text-white text-xs px-5 py-2.5 rounded-xl no-underline shadow-xs"
            >
              Go to Practitioner Portal
            </Link>
          </div>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  // ── GATE 4: Render Authorized UI ──────────────────────────────────────────
  const SelectedSidebar = isAdminRoute ? AdminSidebar : isDoctorRoute ? DoctorSidebar : Sidebar;
  const SelectedTopBar = isAdminRoute ? AdminTopBar : isDoctorRoute ? DoctorTopBar : TopBar;

  return (
    <div className="flex min-h-screen bg-[#FAFAF6] text-[#12160F] antialiased">
      {/* Dynamic Role Sidebar */}
      <SelectedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[68px] lg:ml-[230px] transition-all duration-300">
        <SelectedTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-24 md:pb-16 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Customer only) */}
      {isCustomer && <MobileBottomNav />}

      {/* Dev Role Switcher for local persona testing */}
      <DevRoleSwitcher />
    </div>
  );
}
