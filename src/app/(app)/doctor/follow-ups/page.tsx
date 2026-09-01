'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  User,
  AlertTriangle,
} from 'lucide-react';

const mockFollowUps = [
  {
    id: 'fu-1',
    patientId: 'patient_demo_rahul',
    patientName: 'Rahul Mehta',
    dueDate: '04 Sep 2026',
    daysRemaining: '3 days',
    purpose: 'Review response to shoulder rehabilitation protocol and range of motion.',
    status: 'Pending',
    priority: 'Normal',
  },
  {
    id: 'fu-2',
    patientId: 'patient_demo_priya',
    patientName: 'Priya Sharma',
    dueDate: '10 Sep 2026',
    daysRemaining: '9 days',
    purpose: 'Re-test serum ferritin & post-supplementation energy assessment.',
    status: 'Pending',
    priority: 'Important',
  },
  {
    id: 'fu-3',
    patientId: 'patient_demo_rahul',
    patientName: 'Rahul Mehta',
    dueDate: '20 Aug 2026',
    daysRemaining: 'Completed',
    purpose: 'Initial post-injury assessment check.',
    status: 'Completed',
    priority: 'Normal',
  },
];

export default function DoctorFollowUpsPage() {
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
      </div>

      {/* Follow-up List */}
      <div className="flex flex-col gap-3.5">
        {mockFollowUps.map(fu => (
          <div
            key={fu.id}
            className="fluetas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#F472B6]/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F472B6]/15 text-[#F472B6] font-bold flex items-center justify-center text-base shrink-0">
                {fu.patientName[0]}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                    {fu.patientName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${
                      fu.status === 'Completed'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-[#F472B6]/15 text-[#F472B6]'
                    }`}
                  >
                    {fu.status} · Due {fu.dueDate}
                  </span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  {fu.purpose}
                </p>
              </div>
            </div>

            <Link
              href={`/doctor/patients/${fu.patientId}`}
              className="btn-primary bg-[#F472B6] text-black hover:bg-[#F472B6]/90 text-xs px-4 py-2 font-bold shrink-0 no-underline self-end sm:self-auto shadow-[0_0_12px_rgba(244,114,182,0.25)] flex items-center gap-1"
            >
              Open Chart <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
