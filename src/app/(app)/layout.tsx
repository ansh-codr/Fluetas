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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
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
        <p className="font-heading text-[11px] font-semibold tracking-widest text-ink-subtle uppercase m-0">
          Securing your session...
        </p>
        <div className="w-5 h-5 border-2 border-leaf border-t-transparent rounded-full animate-spin" />
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

  const isDoctorRoute = pathname.startsWith('/doctor');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = !isDoctorRoute && !isAdminRoute;

  const isPractitioner = role === 'doctor' || role === 'expert';
  const isCustomer = role === 'customer';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (isAdminRoute) {
        router.replace('/admin/login');
      } else {
        router.replace('/login');
      }
      return;
    }

    if (!role) return;

    if (isCustomer && isCustomerRoute) {
      if (pathname === '/onboarding') {
        // Use setTimeout to avoid synchronous setState in effect
        const t = setTimeout(() => setOnboardingChecked(true), 0);
        return () => clearTimeout(t);
      }

      if (db) {
        let cancelled = false;
        Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'users', user.uid, 'healthProfile', 'main')),
        ])
          .then(([userSnap, healthSnap]) => {
            if (cancelled) return;
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
            if (!cancelled) setOnboardingChecked(true);
          });
        return () => { cancelled = true; };
      } else {
        const t = setTimeout(() => setOnboardingChecked(true), 0);
        return () => clearTimeout(t);
      }
    } else {
      const t = setTimeout(() => setOnboardingChecked(true), 0);
      return () => clearTimeout(t);
    }
  }, [user, role, loading, router, pathname, isCustomerRoute, isCustomer, isAdminRoute]);

  if (loading || !user || !role || !onboardingChecked) {
    return <ZeroFlashLoadingScreen />;
  }

  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-4 border-red-500/20">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-ink m-0">Account Suspended</h2>
          <p className="text-[13px] text-ink-soft m-0 leading-relaxed">
            Your account has been temporarily suspended by platform administrators. Please contact support@fluetas.com to review your credentials.
          </p>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  if (isCustomer && isDoctorRoute) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-leaf-dim text-leaf flex items-center justify-center">
            <Stethoscope size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-ink m-0">Practitioner Access Required</h2>
          <p className="text-[13px] text-ink-soft m-0 leading-relaxed">
            This clinical area is reserved for licensed doctors and verified wellness practitioners. If you are a practitioner, you can register your credentials with our Medical Board.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/dashboard"
              className="btn-primary text-[12px] px-4 py-2.5"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/expert-register"
              className="btn-ghost text-[12px] px-4 py-2.5"
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
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-ink m-0">Administrator Access Required</h2>
          <p className="text-[13px] text-ink-soft m-0 leading-relaxed">
            Your account does not have platform administration privileges. Administrative roles are server-authoritative and audited.
          </p>
          <div className="pt-1">
            <Link
              href={isPractitioner ? '/doctor/dashboard' : '/dashboard'}
              className="btn-primary text-[12px] px-5 py-2.5"
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
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-tide-dim text-tide flex items-center justify-center">
            <Users size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-ink m-0">This Area is Available to Customer Accounts</h2>
          <p className="text-[13px] text-ink-soft m-0 leading-relaxed">
            You are currently logged in as a clinical practitioner. To access patient records, consultations, and medical review tools, use your practitioner portal.
          </p>
          <div className="pt-1">
            <Link
              href="/doctor/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-tide text-white font-heading font-semibold rounded-xl px-5 py-2.5 text-[12px] hover:opacity-90 transition-opacity no-underline"
            >
              Go to Practitioner Portal
            </Link>
          </div>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  const SelectedSidebar = isAdminRoute ? AdminSidebar : isDoctorRoute ? DoctorSidebar : Sidebar;
  const SelectedTopBar = isAdminRoute ? AdminTopBar : isDoctorRoute ? DoctorTopBar : TopBar;

  return (
    <div className="flex min-h-screen bg-surface text-ink antialiased">
      <SelectedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[68px] lg:ml-[220px] transition-all duration-300">
        <SelectedTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-[60px] flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 pb-24 md:pb-12 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {isCustomer && <MobileBottomNav />}
      <DevRoleSwitcher />
    </div>
  );
}
