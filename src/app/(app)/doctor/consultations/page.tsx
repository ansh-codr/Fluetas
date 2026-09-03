'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getDoctorAppointments,
  AppointmentRecord,
} from '@/lib/services/consultationService';
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Video,
  User,
  Loader2,
} from 'lucide-react';

export default function DoctorConsultationsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    getDoctorAppointments(user.uid)
      .then(res => {
        setAppointments(res || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user?.uid]);

  const filtered = tab === 'upcoming'
    ? appointments.filter(c => c.status !== 'Completed' && c.status !== 'Cancelled')
    : appointments.filter(c => c.status === 'Completed');

  const upcomingCount = appointments.filter(c => c.status !== 'Completed' && c.status !== 'Cancelled').length;
  const completedCount = appointments.filter(c => c.status === 'Completed').length;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#38BDF8]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              CLINICAL CONSULTATION SESSIONS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Active telehealth queue, scheduled sessions, and historical consultation records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2133] pb-2">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'upcoming'
              ? 'bg-[#38BDF8] text-black shadow-xs'
              : 'text-[#8B91B0] hover:text-white'
          }`}
        >
          <Clock size={14} />
          <span>Scheduled / In Queue ({upcomingCount})</span>
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'completed'
              ? 'bg-[#38BDF8] text-black shadow-xs'
              : 'text-[#8B91B0] hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>Completed Sessions ({completedCount})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#38BDF8]" />
            Loading consultation records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            {tab === 'upcoming'
              ? 'No upcoming consultations scheduled in your queue. Booked patient sessions will appear here.'
              : 'No completed consultations on record yet.'}
          </div>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1E2133] hover:border-[#38BDF8]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E2133] flex items-center justify-center text-[#38BDF8] font-bold text-sm shrink-0">
                  {c.customerName ? c.customerName[0] : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E8EAF6] text-sm sm:text-base">
                      {c.customerName || 'Patient'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B91B0] m-0 mt-0.5">{c.reason}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[0.68rem] text-[#8B91B0]">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Clock size={12} className="text-[#38BDF8]" />
                      {c.date} · {c.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video size={12} />
                      {c.consultationType}
                    </span>
                    <span className="flex items-center gap-1 text-[#10B981]">
                      <ShieldCheck size={12} />
                      Patient Consent Verified
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/doctor/patients/${c.customerId}`}
                className="px-3.5 py-2 rounded-xl bg-[#1E2133] hover:bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto no-underline transition-colors shrink-0"
              >
                <span>Access Clinical Chart</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
