'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserConsultations, ConsultationData } from '@/lib/services/consultationService';
import {
  Stethoscope,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUserConsultations(user.uid)
      .then(res => {
        setConsultations(res);
        if (res.length > 0) {
          setExpandedId(res[0].id || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  const upcomingList = consultations.filter(c =>
    ['Requested', 'Booked', 'Scheduled', 'In Progress'].includes(c.status)
  );

  const pastList = consultations.filter(c =>
    ['Completed', 'Report Generated', 'Follow-up Required', 'Cancelled'].includes(c.status)
  );

  const filtered = tab === 'upcoming' ? upcomingList : pastList;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            MY CONSULTATIONS &amp; CLINICAL NOTES
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Encrypted telehealth sessions, clinical assessments, and auto-generated medical summaries.
          </p>
        </div>

        <Link
          href="/experts"
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto no-underline"
        >
          <Plus size={15} />
          Book New Consultation
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E2133] gap-2">
        {[
          { id: 'upcoming', label: `Upcoming Consultations (${upcomingList.length})` },
          { id: 'past', label: `Past Sessions & Reports (${pastList.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
              tab === t.id
                ? 'text-[#10B981] border-[#10B981]'
                : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1E2133]/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="fluetas-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-3">
            <Stethoscope size={26} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
            {tab === 'upcoming' ? 'No upcoming consultations' : 'No past consultation history'}
          </h3>
          <p className="text-xs text-[#8B91B0] m-0 mt-1 max-w-sm">
            {tab === 'upcoming'
              ? 'Schedule a 1-on-1 consultation with top physiotherapists, doctors, and sports nutritionists.'
              : 'Your clinical summaries, prescription notes, and diagnostic tests will be organized here.'}
          </p>
          <Link
            href="/experts"
            className="btn-primary mt-4 flex items-center gap-2 px-5 py-2.5 text-xs font-bold no-underline"
          >
            <Plus size={14} /> Find an Expert
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map(cons => {
            const isExpanded = expandedId === cons.id;

            return (
              <div
                key={cons.id}
                className={`fluetas-card transition-all overflow-hidden ${
                  isExpanded ? 'border-[#10B981]/40' : 'hover:border-[#2A3050]'
                }`}
              >
                {/* Summary Bar */}
                <div
                  onClick={() => cons.id && toggleExpand(cons.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-[#13161F]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-xl shrink-0">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                          {cons.expertName}
                        </h3>
                        <span className="text-xs text-[#8B91B0]">· {cons.specialization}</span>
                      </div>
                      <p className="text-xs text-[#10B981] font-semibold m-0 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} />
                        {cons.preferredDate || 'Date to be confirmed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold ${
                        cons.status === 'Completed'
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : cons.status === 'Requested'
                          ? 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                          : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                      }`}
                    >
                      {cons.status}
                    </span>

                    <button className="text-[#8B91B0] hover:text-white p-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="p-5 bg-[#0B0D14] border-t border-[#1E2133] flex flex-col gap-4 text-xs animate-slide-up">
                    {/* Reported Reason */}
                    <div>
                      <span className="text-[0.68rem] font-bold text-[#8B91B0] uppercase block mb-1">
                        Reason for Consultation &amp; Symptoms Reported
                      </span>
                      <p className="text-xs text-[#E8EAF6] m-0 bg-[#13161F] p-3 rounded-xl border border-[#1E2133]">
                        {cons.reason}
                      </p>
                    </div>

                    {/* Symptoms Tags */}
                    {cons.symptomsReported && cons.symptomsReported.length > 0 && (
                      <div>
                        <span className="text-[0.68rem] font-bold text-[#8B91B0] uppercase block mb-1">
                          Reported Symptoms
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cons.symptomsReported.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md bg-[#38BDF8]/15 text-[#38BDF8] text-[0.7rem] font-semibold border border-[#38BDF8]/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Consent status */}
                    <div className="p-3 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl flex items-center gap-2 text-[#10B981]">
                      <ShieldCheck size={16} className="shrink-0" />
                      <span>Encrypted HIPAA-aligned health record consent granted for this provider.</span>
                    </div>

                    {/* Doctor Clinical Notes (if completed) */}
                    {cons.clinicalNotes ? (
                      <div className="space-y-3 bg-[#13161F] p-4 rounded-xl border border-[#1E2133]">
                        <div>
                          <span className="text-[0.68rem] font-bold text-[#38BDF8] uppercase block mb-0.5">
                            Doctor&apos;s Clinical Examination Notes
                          </span>
                          <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
                            {cons.clinicalNotes}
                          </p>
                        </div>

                        {cons.assessment && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-[#10B981] uppercase block mb-0.5">
                              Clinical Assessment &amp; Findings
                            </span>
                            <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
                              {cons.assessment}
                            </p>
                          </div>
                        )}

                        {cons.advice && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-[#FBBF24] uppercase block mb-0.5">
                              Actionable Recommendations &amp; Prescriptions
                            </span>
                            <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
                              {cons.advice}
                            </p>
                          </div>
                        )}

                        {cons.suggestedTests && cons.suggestedTests.length > 0 && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-[#F472B6] uppercase block mb-1">
                              Suggested Diagnostic Tests
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cons.suggestedTests.map((test, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-md bg-[#F472B6]/15 text-[#F472B6] text-[0.7rem] font-semibold border border-[#F472B6]/30"
                                >
                                  {test}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#38BDF8]">
                        <span>Encrypted telehealth room link will activate when appointment time is confirmed.</span>
                        <button
                          onClick={() => alert('Consultation details are under doctor confirmation.')}
                          className="px-3 py-1.5 rounded-lg bg-[#38BDF8] text-black font-bold text-xs shrink-0 cursor-pointer"
                        >
                          Check Status
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
