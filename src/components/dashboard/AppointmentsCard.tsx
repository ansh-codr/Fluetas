'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUpcomingConsultations, ConsultationData } from '@/lib/services/consultationService';
import { Calendar, Clock, Stethoscope, Plus, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

export default function AppointmentsCard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUpcomingConsultations(user.uid)
      .then(res => {
        setAppointments(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between h-full bg-[#FFFFFF]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Stethoscope size={13} className="text-[#2E6DA4]" />
            <span className="section-title">Upcoming Care</span>
          </div>
          <Link
            href="/consultations"
            className="text-[#2E6DA4] text-xs font-semibold hover:underline no-underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center mb-2">
              <Calendar size={18} />
            </div>
            <p className="text-xs font-bold text-[#12160F] m-0">No upcoming consultations</p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5 max-w-[200px]">
              Connect with certified clinical practitioners and physiotherapists.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {appointments.slice(0, 3).map(apt => (
              <div
                key={apt.id}
                id={`appointment-${apt.id}`}
                className="flex items-center gap-3 p-2.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] hover:border-[#2E6DA4]/30 transition-colors"
              >
                {apt.expertName?.toLowerCase().includes('swati') ? (
                  <img
                    src="/assets/dr-swati-dixit-square.jpg"
                    alt={apt.expertName}
                    className="w-9 h-9 rounded-xl object-cover object-top shrink-0 border border-[rgba(18,22,15,0.10)]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#2E6DA4] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs">
                    {apt.expertName ? apt.expertName.split(' ')[1]?.[0] || apt.expertName[0] : 'Dr'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-[#12160F] text-xs font-bold m-0 truncate">
                    {apt.expertName}
                  </p>
                  <p className="text-[#586151] text-[0.6875rem] m-0 truncate">{apt.specialization}</p>
                  <span className="flex items-center gap-1 text-[0.65rem] text-[#2E6DA4] font-semibold mt-0.5">
                    <Clock size={10} /> {apt.scheduledAt ? (typeof apt.scheduledAt === 'string' ? apt.scheduledAt : 'Scheduled') : 'Scheduled'}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20">
                    {apt.status || 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/experts"
        id="book-consultation-btn"
        className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-[rgba(18,22,15,0.18)] hover:border-[#2E6DA4] text-[#2E6DA4] bg-[#FAFAF6] hover:bg-[#FFFFFF] text-xs font-semibold text-center no-underline transition-all"
      >
        <Plus size={14} /> Find an Expert
      </Link>
    </div>
  );
}
