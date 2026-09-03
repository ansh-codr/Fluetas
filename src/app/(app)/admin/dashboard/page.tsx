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
  Loader2,
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
        setDoctors(d || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const pendingDoctors = doctors.filter(d => (d.verificationStatus || 'pending') === 'pending');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-6 sm:p-7 bg-[#12160F] text-white relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#D9622B]/20 text-[#D9622B] border border-[#D9622B]/40 flex items-center gap-1">
                <Shield size={11} />
                Root Administration Console
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
              PLATFORM TELEMETRY &amp; GOVERNANCE
            </h1>
            <p className="text-[#A3AA9C] text-xs sm:text-sm m-0 mt-1 max-w-xl">
              Real-time operational oversight, practitioner verification, user RBAC governance, and compliance audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/practitioners"
              className="px-4 py-2.5 rounded-xl bg-[#D9622B] hover:bg-[#B84E1E] text-white text-xs font-bold flex items-center gap-2 no-underline transition-colors shadow-xs"
            >
              <FileCheck size={15} />
              Review Applications ({pendingDoctors.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: 'Total Registered Users', num: metrics?.totalCustomers || 0, color: '#2E7D32', icon: Users, sub: `${metrics?.activeCustomers || 0} active members` },
          { label: 'Verified Practitioners', num: metrics?.verifiedDoctors || 0, color: '#2E6DA4', icon: Stethoscope, sub: `${metrics?.pendingDoctorVerifications || pendingDoctors.length} pending review` },
          { label: 'Platform Consultations', num: metrics?.totalConsultations || 0, color: '#D9622B', icon: Calendar, sub: 'Total telehealth appointments' },
          { label: 'Audit Trail Records', num: metrics?.auditLogsCount || 0, color: '#7A4E9E', icon: Activity, sub: 'Immutable compliance events' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fluetas-card p-4.5 flex flex-col justify-between gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#586151] font-bold">{stat.label}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <p className="font-['Outfit'] text-3xl font-black m-0" style={{ color: stat.color }}>
                  <AnimatedNumber value={stat.num} duration={500} />
                </p>
                <p className="text-[0.68rem] text-[#586151] font-medium m-0 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Grid: Doctor Verifications & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Doctor Applications Awaiting Verification */}
        <div className="lg:col-span-2 fluetas-card p-5 bg-white border border-[rgba(18,22,15,0.08)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(18,22,15,0.06)]">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#D9622B]" />
              <h2 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                PRACTITIONER APPLICATIONS PENDING REVIEW ({pendingDoctors.length})
              </h2>
            </div>
            <Link href="/admin/practitioners" className="text-xs text-[#D9622B] hover:text-[#B84E1E] font-bold no-underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#586151]">
              <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[#D9622B]" />
              Loading applications...
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-8 bg-[#FAFAF6] rounded-2xl border border-[rgba(18,22,15,0.06)] text-center text-xs text-[#586151]">
              All submitted practitioner applications have been reviewed.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingDoctors.slice(0, 5).map(doc => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[rgba(18,22,15,0.20)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(18,22,15,0.10)] text-[#D9622B] font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                      {doc.name ? doc.name[0] : 'Dr'}
                    </div>
                    <div>
                      <h4 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-[#586151] m-0 mt-0.5">
                        {doc.specialization} · {doc.credentials}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/practitioners"
                    className="px-3.5 py-1.5 rounded-xl bg-[#D9622B]/10 hover:bg-[#D9622B]/20 text-[#D9622B] text-xs font-bold no-underline text-center shrink-0 transition-colors"
                  >
                    Verify Credentials
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Admin Navigation */}
        <div className="fluetas-card p-5 bg-white border border-[rgba(18,22,15,0.08)] flex flex-col justify-between">
          <div>
            <span className="section-title mb-3 block">ADMINISTRATIVE MODULES</span>
            <div className="flex flex-col gap-2">
              {[
                { label: 'User Directory & RBAC', href: '/admin/users', icon: Users, color: '#2E7D32' },
                { label: 'Practitioner Review Hub', href: '/admin/practitioners', icon: Stethoscope, color: '#2E6DA4' },
                { label: 'Consultations Operations', href: '/admin/consultations', icon: Calendar, color: '#D9622B' },
                { label: 'Exercise Content Manager', href: '/admin/exercises', icon: Dumbbell, color: '#7A4E9E' },
                { label: 'Compliance Audit Trail', href: '/admin/audit-logs', icon: Shield, color: '#12160F' },
              ].map(mod => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF6] hover:bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] text-[#12160F] text-xs font-bold no-underline transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                      >
                        <Icon size={14} />
                      </div>
                      <span>{mod.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-[#8A9482]" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[rgba(18,22,15,0.06)] text-[0.68rem] text-[#586151] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#2E7D32]" />
            <span>Sovereign Platform Governance Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
