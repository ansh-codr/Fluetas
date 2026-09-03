'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { ShieldAlert } from 'lucide-react';

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

    // 2. Cross-role unauthorized access redirection
    if (isCustomer && (isDoctorRoute || isAdminRoute)) {
      router.replace('/dashboard');
      return;
    }

    if (isPractitioner && (isCustomerRoute || isAdminRoute)) {
      router.replace('/doctor/dashboard');
      return;
    }

    if (isAdmin && (isCustomerRoute || isDoctorRoute)) {
      router.replace('/admin/dashboard');
      return;
    }

    if (!isAdmin && isAdminRoute) {
      router.replace('/admin/login');
      return;
    }

    // 3. Customer onboarding check (only for verified customers on customer paths)
    if (isCustomer && isCustomerRoute && pathname !== '/onboarding') {
      if (db) {
        getDoc(doc(db, 'users', user.uid))
          .then((snap) => {
            if (snap.exists() && snap.data()?.onboardingComplete === false) {
              router.replace('/onboarding');
            }
          })
          .catch(() => {});
      }
    }
  }, [user, role, loading, router, pathname, isDoctorRoute, isAdminRoute, isCustomerRoute, isCustomer, isPractitioner, isAdmin]);

  // ── GATE 1: Session & Role Resolution ─────────────────────────────────────
  // Mandatory Zero-Flash: NEVER render children or dashboard before auth & role are fully known
  if (loading || !user || !role) {
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

  // ── GATE 3: Role Route Authorization Matrix ──────────────────────────────
  // Intercept mismatched roles immediately: NEVER render the wrong dashboard
  if (isCustomer && (isDoctorRoute || isAdminRoute)) {
    return <ZeroFlashLoadingScreen />;
  }

  if (isPractitioner && (isCustomerRoute || isAdminRoute)) {
    return <ZeroFlashLoadingScreen />;
  }

  if (isAdmin && (isCustomerRoute || isDoctorRoute)) {
    return <ZeroFlashLoadingScreen />;
  }

  if (!isAdmin && isAdminRoute) {
    return <ZeroFlashLoadingScreen />;
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
