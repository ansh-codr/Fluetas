'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Video,
  User,
} from 'lucide-react';

const mockDoctorConsultations = [
  {
    id: 'cons-1',
    patientId: 'patient_demo_rahul',
    patientName: 'Rahul Mehta',
    date: 'Today · 04:30 PM',
    type: 'Telehealth Video',
    reason: 'Rotator cuff impingement follow-up and mobility review',
    status: 'Confirmed',
    consentVerified: true,
  },
  {
    id: 'cons-2',
    patientId: 'patient_demo_priya',
    patientName: 'Priya Sharma',
    date: 'Today · 06:00 PM',
    type: 'Telehealth Video',
    reason: 'Post-menstrual iron deficiency & fatigue management',
    status: 'Scheduled',
    consentVerified: true,
  },
  {
    id: 'cons-3',
    patientId: 'patient_demo_rahul',
    patientName: 'Rahul Mehta',
    date: '24 Aug 2026',
    type: 'Telehealth Video',
    reason: 'Initial consultation regarding shoulder pinch during bench press',
    status: 'Completed',
    consentVerified: true,
  },
];

export default function DoctorConsultationsPage() {
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');

  const filtered = tab === 'upcoming'
    ? mockDoctorConsultations.filter(c => c.status !== 'Completed')
    : mockDoctorConsultations.filter(c => c.status === 'Completed');

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#38BDF8]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              CLINICAL CONSULTATIONS SESSIONS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Active telehealth queue, scheduled sessions, and historical consultation records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E2133] gap-2">
        {[
          { id: 'upcoming', label: `Scheduled / In Queue (${mockDoctorConsultations.filter(c => c.status !== 'Completed').length})` },
          { id: 'completed', label: `Completed Sessions (${mockDoctorConsultations.filter(c => c.status === 'Completed').length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
              tab === t.id
                ? 'text-[#38BDF8] border-[#38BDF8]'
                : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      <div className="flex flex-col gap-3.5">
        {filtered.map(cons => (
          <div
            key={cons.id}
            className="fluetas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#38BDF8]/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-bold flex items-center justify-center text-lg shrink-0">
                {cons.patientName[0]}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                    {cons.patientName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${
                      cons.status === 'Completed'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8]'
                    }`}
                  >
                    {cons.status}
                  </span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  {cons.reason}
                </p>
                <div className="flex items-center gap-3 text-[0.68rem] text-[#38BDF8] font-semibold mt-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {cons.date}</span>
                  <span className="flex items-center gap-1 text-[#10B981]"><ShieldCheck size={12} /> Consent Verified</span>
                </div>
              </div>
            </div>

            <Link
              href={`/doctor/patients/${cons.patientId}`}
              className="btn-primary bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 text-xs px-4 py-2 font-bold shrink-0 no-underline self-end sm:self-auto shadow-[0_0_12px_rgba(56,189,248,0.25)] flex items-center gap-1"
            >
              Open Workspace <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
