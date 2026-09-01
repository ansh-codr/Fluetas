'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Stethoscope,
  FileText,
  Activity,
  Award,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const mockTimelineEvents = [
  {
    id: 'tl-1',
    type: 'consultation',
    date: 'Tomorrow, 11:00 AM',
    title: 'Consultation Scheduled with Dr. Anjali Mehta',
    description: 'Lumbar spine assessment and rotator cuff stabilization protocol review.',
    category: 'Clinical',
    color: '#7C3AED',
    icon: Stethoscope,
    badge: 'Upcoming',
  },
  {
    id: 'tl-2',
    type: 'doctor_review',
    date: '19 Jul 2026',
    title: 'Diagnostic Review: Comprehensive Metabolic Panel',
    description: 'Dr. Priya Sharma reviewed lab results. Initiated Vitamin D3 60k IU weekly protocol.',
    category: 'Review',
    color: '#10B981',
    icon: CheckCircle2,
    badge: 'Completed',
  },
  {
    id: 'tl-3',
    type: 'report_uploaded',
    date: '18 Jul 2026',
    title: 'Lab Report Uploaded: Vitamin D3 & Blood Count',
    description: 'Direct laboratory sync from Thyrocare Diagnostics (2.4 MB PDF).',
    category: 'Diagnostics',
    color: '#38BDF8',
    icon: FileText,
    badge: 'Verified',
  },
  {
    id: 'tl-4',
    type: 'consultation',
    date: '15 Jul 2026',
    title: 'Orthopedic Clearance with Dr. Rajesh Nair',
    description: '2-year post meniscus repair evaluation. Full athletic lifting clearance granted.',
    category: 'Clinical',
    color: '#2563EB',
    icon: Stethoscope,
    badge: 'Completed',
  },
  {
    id: 'tl-5',
    type: 'recommendation',
    date: '15 Jul 2026',
    title: 'Rehabilitation Protocol Appended',
    description: 'Prescribed terminal knee extensions (TKEs) and eccentric hamstring loading.',
    category: 'Protocol',
    color: '#F59E0B',
    icon: Activity,
    badge: 'Active',
  },
  {
    id: 'tl-6',
    type: 'profile_created',
    date: '10 Jan 2026',
    title: 'FLUETAS Profile Initialized',
    description: 'Baseline health record created. Connected Apple Health & Garmin trackers.',
    category: 'System',
    color: '#10B981',
    icon: Award,
    badge: 'Milestone',
  },
];

export default function TimelinePage() {
  const [filter, setFilter] = useState<'all' | 'clinical' | 'diagnostics' | 'protocols'>('all');

  const filteredEvents = filter === 'all'
    ? mockTimelineEvents
    : mockTimelineEvents.filter(e => {
        if (filter === 'clinical') return e.category === 'Clinical';
        if (filter === 'diagnostics') return e.category === 'Diagnostics' || e.category === 'Review';
        if (filter === 'protocols') return e.category === 'Protocol';
        return true;
      });

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] to-[#161B2B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-[#10B981]" size={20} />
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
                CHRONOLOGICAL HEALTH TIMELINE
              </h1>
            </div>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
              Immutable historical record of every medical consult, test result, and recommendation.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0B0D14] p-1 rounded-xl border border-[#1E2133] self-start sm:self-auto overflow-x-auto">
            <Filter size={13} className="text-[#8B91B0] ml-1.5 mr-0.5 shrink-0 hidden xs:block" />
            {[
              { id: 'all', label: 'All' },
              { id: 'clinical', label: 'Clinical' },
              { id: 'diagnostics', label: 'Diagnostics' },
              { id: 'protocols', label: 'Protocols' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-[#10B981] text-black font-bold'
                    : 'text-[#8B91B0] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-[2px] before:bg-[#1E2133]">
        {filteredEvents.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#0B0D14] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: evt.color }}
              >
                <Icon size={14} />
              </div>

              {/* Event Card */}
              <div className="fluetas-card p-4 sm:p-5 hover:border-[#2A3050] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${evt.color}20`, color: evt.color }}>
                      {evt.category}
                    </span>
                    <span className="text-xs font-medium text-[#8B91B0]">{evt.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#1E2133] text-[#E8EAF6] self-start sm:self-auto">
                    {evt.badge}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#E8EAF6] m-0 mb-1 font-['Outfit']">
                  {evt.title}
                </h3>
                <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
