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
    <div className="fluetas-card-interactive p-4 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span className="section-title">UPCOMING CONSULTATIONS</span>
          <Link
            href="/consultations"
            className="text-[#10B981] text-xs font-semibold hover:underline no-underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
            <p className="text-xs font-semibold text-[#E8EAF6] m-0">No upcoming consultations</p>
            <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">
              Connect with certified doctors and physios.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {appointments.slice(0, 3).map(apt => (
              <div
                key={apt.id}
                id={`appointment-${apt.id}`}
                className="flex items-center gap-3 p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] hover:border-[#10B981]/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                  {apt.expertName ? apt.expertName.split(' ')[1]?.[0] || apt.expertName[0] : 'Dr'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#E8EAF6] text-xs font-bold m-0 truncate">
                    {apt.expertName}
                  </p>
                  <p className="text-[#8B91B0] text-[0.68rem] m-0 truncate">{apt.specialization}</p>
                  <span className="flex items-center gap-1 text-[0.62rem] text-[#10B981] font-semibold mt-0.5">
                    <Clock size={10} /> Starts in 18h 24m
                  </span>
                </div>

                {/* Status */}
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
                      apt.status === 'Booked' || apt.status === 'Scheduled'
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                    }`}
                  >
                    {apt.status}
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
        className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-[#2A3050] hover:border-[#10B981]/50 text-[#10B981] text-xs font-semibold text-center no-underline transition-all"
      >
        <Plus size={14} /> Book New Consultation
      </Link>
    </div>
  );
}
