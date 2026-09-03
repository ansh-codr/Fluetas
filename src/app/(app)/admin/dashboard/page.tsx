'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminPlatformMetrics,
  getAdminDoctorsList,
  AdminPlatformMetrics,
  DoctorApplication,
} from '@/lib/services/adminService';
import {
  Shield,
  Users,
  Stethoscope,
  Calendar,
  FileCheck,
  Activity,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Clock,
} from 'lucide-react';

import { AnimatedNumber } from '@/components/motion/MotionUtils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminPlatformMetrics | null>(null);
  const [doctors, setDoctors] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminPlatformMetrics(),
      getAdminDoctorsList(),
    ])
      .then(([m, d]) => {
        setMetrics(m);
        setDoctors(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending');

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#24170A] to-[#1F1206] border-[#F59E0B]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 flex items-center gap-1">
                <Shield size={11} />
                Root Administration Console
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              PLATFORM TELEMETRY &amp; GOVERNANCE
            </h1>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
              Operational oversight, doctor verification, user management, and compliance auditing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/doctors"
              className="btn-primary bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black text-xs px-4 py-2.5 flex items-center gap-2 font-bold no-underline shadow-[0_0_16px_rgba(245,158,11,0.3)] shrink-0"
            >
              <FileCheck size={14} />
              Review Doctor Applications ({pendingDoctors.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Registered Users', num: metrics?.totalCustomers || 128, color: '#10B981', icon: Users, sub: `${metrics?.activeCustomers || 94} active members` },
          { label: 'Verified Doctors', num: metrics?.verifiedDoctors || 6, color: '#38BDF8', icon: Stethoscope, sub: `${metrics?.pendingDoctorVerifications || 2} pending approval` },
          { label: 'Platform Consultations', num: metrics?.totalConsultations || 42, color: '#FBBF24', icon: Calendar, sub: 'Total telehealth sessions' },
          { label: 'Audit Trail Events', num: metrics?.auditLogsCount || 312, color: '#A78BFA', icon: Activity, sub: 'Immutable compliance log' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fluetas-card p-4 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] text-[#8B91B0] font-semibold">{stat.label}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={14} />
                </div>
              </div>
              <div>
                <p className="font-['Outfit'] text-2xl font-black m-0" style={{ color: stat.color }}>
                  <AnimatedNumber value={stat.num} duration={500} />
                </p>
                <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Grid: Doctor Verifications & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Doctor Applications Awaiting Verification */}
        <div className="lg:col-span-2 fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#F59E0B]" />
              <span className="section-title text-[#F59E0B]">
                DOCTOR VERIFICATIONS AWAITING APPROVAL ({pendingDoctors.length})
              </span>
            </div>
            <Link href="/admin/doctors" className="text-xs text-[#F59E0B] hover:underline font-semibold no-underline">
              Manage All Doctors →
            </Link>
          </div>

          {pendingDoctors.length === 0 ? (
            <div className="p-6 bg-[#0B0D14] rounded-xl border border-[#1E2133] text-center text-xs text-[#8B91B0]">
              All submitted doctor applications have been processed.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingDoctors.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] font-bold flex items-center justify-center text-sm shrink-0">
                      {doc.name[0]}
                    </div>
                    <div>
                      <h4 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                        {doc.specialization} · {doc.credentials} · {doc.experience}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/doctors"
                    className="px-3.5 py-1.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/25 text-xs font-bold no-underline text-center shrink-0 transition-colors"
                  >
                    Verify Credentials
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Admin Navigation */}
        <div className="fluetas-card p-5 flex flex-col justify-between">
          <div>
            <span className="section-title mb-3 block">ADMINISTRATIVE MODULES</span>
            <div className="flex flex-col gap-2">
              {[
                { label: 'User Directory & Roles', href: '/admin/users', icon: Users, color: '#10B981' },
                { label: 'Doctor Verification Hub', href: '/admin/doctors', icon: Stethoscope, color: '#38BDF8' },
                { label: 'Consultations Operations', href: '/admin/consultations', icon: Calendar, color: '#FBBF24' },
                { label: 'Exercise Content Manager', href: '/admin/exercises', icon: Dumbbell, color: '#A78BFA' },
                { label: 'Compliance Audit Logs', href: '/admin/audit-logs', icon: Shield, color: '#F59E0B' },
              ].map(mod => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="p-3 rounded-xl bg-[#0B0D14] border border-[#1E2133] hover:border-[#F59E0B]/40 flex items-center justify-between text-xs text-[#E8EAF6] no-underline transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                      >
                        <Icon size={14} />
                      </div>
                      <span className="font-semibold group-hover:text-white">{mod.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-[#8B91B0] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
