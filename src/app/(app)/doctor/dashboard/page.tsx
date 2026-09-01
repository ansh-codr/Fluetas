'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getAuthorizedPatientsForDoctor,
  DoctorPatientRelationship,
} from '@/lib/services/doctorService';
import { AnimatedNumber, Skeleton, StaggerItem } from '@/components/motion/MotionUtils';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<DoctorPatientRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorId = user?.uid || 'dr_rajesh_sharma';

  useEffect(() => {
    getAuthorizedPatientsForDoctor(doctorId)
      .then(res => {
        setPatients(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [doctorId]);

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* ── Stagger 0: Doctor Header Banner ── */}
      <StaggerItem index={0}>
        <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#0E2433] to-[#0A1A24] border-[#38BDF8]/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Verified Clinical Practitioner Portal
                </span>
              </div>
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
                WELCOME, {user?.displayName ? user.displayName.toUpperCase() : 'DR. RAJESH SHARMA'}
              </h1>
              <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
                Encrypted clinical consultations, patient consent enforcement, and lab reviews.
              </p>
            </div>

            <Link
              href="/doctor/patients"
              className="btn-primary bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-black text-xs px-4 py-2.5 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center font-bold no-underline shadow-[0_0_16px_rgba(56,189,248,0.3)] hover:opacity-95 transition-all"
            >
              <Users size={14} />
              View Authorized Patients ({patients.length})
            </Link>
          </div>
        </div>
      </StaggerItem>

      {/* ── Stagger 1: Metric Cards Bar with Animated Number Counters ── */}
      <StaggerItem index={1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Authorized Patients', value: Math.max(patients.length, 2), color: '#38BDF8', icon: Users, sub: 'Active consent granted' },
            { label: "Today's Sessions", value: 3, color: '#10B981', icon: Calendar, sub: 'Next at 04:30 PM' },
            { label: 'Pending Lab Reviews', value: 2, color: '#FBBF24', icon: FileText, sub: 'Blood panel & MRI' },
            { label: 'Follow-ups Due', value: 4, color: '#F472B6', icon: Clock, sub: 'Post-op & rehab' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="fluetas-card-interactive p-4 flex flex-col justify-between gap-2 group">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] text-[#8B91B0] font-semibold">{stat.label}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={14} />
                  </div>
                </div>
                <div>
                  <p className="font-['Outfit'] text-2xl font-black m-0 font-mono" style={{ color: stat.color }}>
                    <AnimatedNumber value={stat.value} duration={800} />
                  </p>
                  <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </StaggerItem>

      {/* ── Stagger 2: Main Clinical Split Grid ── */}
      <StaggerItem index={2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Consultation Queue & Lab Reports */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Today's Consultations Queue with Pulsing Statuses */}
            <div className="fluetas-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#38BDF8]" />
                  <span className="section-title">TODAY&apos;S SCHEDULED SESSIONS</span>
                </div>
                <Link href="/doctor/consultations" className="text-xs text-[#38BDF8] hover:underline font-semibold no-underline">
                  View All →
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'cons-1', patientName: 'Rahul Mehta', patientId: 'patient_demo_rahul', time: '04:30 PM (In 45 min)', reason: 'Rotator cuff impingement follow-up', status: 'Waiting', statusType: 'waiting' },
                  { id: 'cons-2', patientName: 'Priya Sharma', patientId: 'patient_demo_priya', time: '06:00 PM', reason: 'Post-menstrual iron deficiency & fatigue', status: 'In Progress', statusType: 'in_progress' },
                  { id: 'cons-3', patientName: 'Arjun Verma', patientId: 'patient_demo_rahul', time: '02:00 PM', reason: 'Lumbar spine decompression review', status: 'Completed', statusType: 'completed' },
                ].map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#38BDF8]/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-bold flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                        {item.patientName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
                            {item.patientName}
                          </h4>

                          {/* Status Badge with Soft Pulse */}
                          {item.statusType === 'waiting' && (
                            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse-soft" />
                              Waiting in Lobby
                            </span>
                          )}
                          {item.statusType === 'in_progress' && (
                            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse-soft" />
                              In Progress
                            </span>
                          )}
                          {item.statusType === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                          {item.reason} · <span className="text-[#38BDF8] font-semibold">{item.time}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/doctor/patients/${item.patientId}`}
                      className="btn-primary bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 text-xs px-3.5 py-1.5 font-bold shrink-0 no-underline self-end sm:self-auto shadow-[0_0_12px_rgba(56,189,248,0.2)] flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Diagnostic Reports */}
            <div className="fluetas-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#FBBF24]" />
                  <span className="section-title text-[#FBBF24]">REPORTS PENDING CLINICAL REVIEW</span>
                </div>
                <Link href="/doctor/reports" className="text-xs text-[#FBBF24] hover:underline font-semibold no-underline">
                  Open Document Viewer →
                </Link>
              </div>

              <div className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex items-center justify-between gap-3 hover:border-[#FBBF24]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
                      Comprehensive Metabolic &amp; Vitamin D Panel
                    </h4>
                    <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                      Patient: <strong>Rahul Mehta</strong> · Uploaded: 28 Aug 2026 (PDF, 2.4 MB)
                    </p>
                  </div>
                </div>

                <Link
                  href="/doctor/reports"
                  className="px-3.5 py-1.5 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] hover:bg-[#FBBF24]/25 border border-[#FBBF24]/30 text-xs font-bold shrink-0 no-underline transition-colors flex items-center gap-1"
                >
                  Review Report →
                </Link>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Quick Patients & Follow-ups */}
          <div className="flex flex-col gap-5">
            {/* Quick Patients */}
            <div className="fluetas-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="section-title">AUTHORIZED PATIENTS</span>
                  <Link href="/doctor/patients" className="text-xs text-[#38BDF8] hover:underline font-semibold no-underline">
                    All ({patients.length})
                  </Link>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-[#8B91B0] m-0">No active patient relationships yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {patients.slice(0, 4).map(p => (
                      <Link
                        key={p.relationshipId}
                        href={`/doctor/patients/${p.customerId}`}
                        className="p-2.5 rounded-xl bg-[#0B0D14] border border-[#1E2133] hover:border-[#38BDF8]/40 flex items-center justify-between text-xs text-[#E8EAF6] no-underline transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                            {p.customerName[0]}
                          </div>
                          <span className="font-semibold">{p.customerName}</span>
                        </div>
                        <ChevronRight size={14} className="text-[#8B91B0] group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Follow-ups Box */}
            <div className="fluetas-card p-5 bg-gradient-to-br from-[#13161F] to-[#1F1122] border-[#F472B6]/25">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-[#F472B6]" />
                <span className="section-title text-[#F472B6]">DUE FOLLOW-UPS</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] hover:border-[#F472B6]/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-[#E8EAF6]">Rahul Mehta</strong>
                    <span className="text-[0.62rem] text-[#F472B6] font-bold font-mono">In 3 days</span>
                  </div>
                  <p className="text-[0.7rem] text-[#8B91B0] m-0">
                    Review response to shoulder rehabilitation exercises.
                  </p>
                </div>

                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] hover:border-[#F472B6]/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-[#E8EAF6]">Sneha Kapoor</strong>
                    <span className="text-[0.62rem] text-[#F472B6] font-bold font-mono">10 Sep 2026</span>
                  </div>
                  <p className="text-[0.7rem] text-[#8B91B0] m-0">
                    Post-dietary change blood glucose (HbA1c) follow-up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>
    </div>
  );
}
