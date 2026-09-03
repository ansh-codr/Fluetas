'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getDoctorFollowUpsList,
  FollowUpRecord,
} from '@/lib/services/consultationService';
import {
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  User,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function DoctorFollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    getDoctorFollowUpsList(user.uid)
      .then(res => {
        setFollowUps(res || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user?.uid]);

  const pendingCount = followUps.filter(f => f.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={20} className="text-[#F472B6]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              CLINICAL FOLLOW-UPS TRACKER
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Monitor patient recovery milestones, lab re-testing reminders, and scheduled check-ins.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 self-start sm:self-auto">
          {pendingCount} Active Milestones
        </span>
      </div>

      {/* Follow-up Items */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#F472B6]" />
            Loading follow-up reminders...
          </div>
        ) : followUps.length === 0 ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            No scheduled follow-up milestones on record. Follow-up dates assigned during patient consultations will appear here automatically.
          </div>
        ) : (
          followUps.map(item => (
            <div
              key={item.id}
              className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1E2133] hover:border-[#F472B6]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E2133] flex items-center justify-center text-[#F472B6] font-bold text-sm shrink-0">
                  {item.customerName ? item.customerName[0] : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E8EAF6] text-sm sm:text-base">
                      {item.customerName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                      item.status === 'Completed'
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B91B0] m-0 mt-0.5">{item.purpose}</p>
                  <div className="flex items-center gap-3 mt-2 text-[0.68rem] text-[#8B91B0]">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Calendar size={12} className="text-[#F472B6]" />
                      Due: {item.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/doctor/patients/${item.customerId}`}
                className="px-3.5 py-2 rounded-xl bg-[#1E2133] hover:bg-[#F472B6]/20 text-[#F472B6] text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto no-underline transition-colors shrink-0"
              >
                <span>Review Chart</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
