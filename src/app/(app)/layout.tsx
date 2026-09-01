'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import DoctorTopBar from '@/components/layout/DoctorTopBar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopBar from '@/components/layout/AdminTopBar';
import DevRoleSwitcher from '@/components/auth/DevRoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/config';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, status, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isDoctorRoute = pathname.startsWith('/doctor');
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (loading) return;

    // Not authenticated → send to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Authenticated customer: check onboarding completion (only for customer paths)
    if (role === 'customer' && !isDoctorRoute && !isAdminRoute) {
      const checkOnboarding = async () => {
        if (!db) return;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const data = userDoc.data();
          const isComplete = data?.onboardingComplete === true;
          if (!isComplete && pathname !== '/onboarding') {
            router.replace('/onboarding');
          }
        } catch {
          // ignore
        }
      };
      checkOnboarding();
    }
  }, [user, role, loading, router, pathname, isDoctorRoute, isAdminRoute]);

  // Loading Screen
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
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
          <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Account Suspended Screen
  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 border-red-500/30">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center text-2xl">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6] m-0">Account Suspended</h2>
          <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
            Your account has been temporarily suspended by system administrators. Please reach out to support@fluetas.com to resolve any verification issues.
          </p>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  // Unauthorized Access Guard
  // 1. Doctor route accessed by non-doctor (and non-admin)
  if (isDoctorRoute && role !== 'doctor' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 border-[#38BDF8]/30">
          <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center text-2xl">
            <Lock size={28} />
          </div>
          <span className="px-2.5 py-0.5 rounded text-[0.65rem] font-bold bg-[#38BDF8]/15 text-[#38BDF8]">
            403 · Access Denied
          </span>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6] m-0">
            Doctor Panel Restricted
          </h2>
          <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
            The clinical portal is strictly restricted to verified doctors and practitioners. Use the role switcher below to switch to the Doctor persona.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary mt-3 flex items-center gap-2 text-xs font-bold px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} /> Return to Customer Dashboard
          </Link>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  // 2. Admin route accessed by non-admin
  if (isAdminRoute && role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center p-4">
        <div className="fluetas-card p-8 max-w-md w-full text-center flex flex-col items-center gap-3 border-amber-500/30">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-2xl">
            <Lock size={28} />
          </div>
          <span className="px-2.5 py-0.5 rounded text-[0.65rem] font-bold bg-amber-500/15 text-amber-400">
            403 · Access Denied
          </span>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6] m-0">
            Administrator Access Required
          </h2>
          <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
            This console is restricted to platform superadministrators. All unauthorized attempts are logged to the immutable audit trail.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary mt-3 flex items-center gap-2 text-xs font-bold px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} /> Return to Customer Dashboard
          </Link>
          <DevRoleSwitcher />
        </div>
      </div>
    );
  }

  // Render Role-Specific Sidebar & TopBar
  const SelectedSidebar = isAdminRoute ? AdminSidebar : isDoctorRoute ? DoctorSidebar : Sidebar;
  const SelectedTopBar = isAdminRoute ? AdminTopBar : isDoctorRoute ? DoctorTopBar : TopBar;

  return (
    <div className="flex min-h-screen bg-[#0B0D14] text-[#E8EAF6] antialiased">
      {/* Dynamic Role Sidebar */}
      <SelectedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[68px] lg:ml-[220px] transition-all duration-300">
        <SelectedTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-28 md:pb-32 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Dev Role Switcher for instant persona testing */}
      <DevRoleSwitcher />
    </div>
  );
}
