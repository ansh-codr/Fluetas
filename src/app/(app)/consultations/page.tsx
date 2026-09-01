'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockConsultationsList } from '@/lib/mock/dashboardData';
import {
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function ConsultationsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>('cons-03');

  const filtered = mockConsultationsList.filter(c => {
    if (tab === 'upcoming') return c.status === 'Upcoming';
    return c.status === 'Completed';
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            MY CONSULTATIONS & CLINICAL NOTES
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
          { id: 'upcoming', label: 'Upcoming Consultations (2)' },
          { id: 'past', label: 'Past Sessions & Reports (1)' },
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
                onClick={() => toggleExpand(cons.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-[#13161F]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-xl shrink-0">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                        {cons.doctorName}
                      </h3>
                      <span className="text-xs text-[#8B91B0]">· {cons.specialization}</span>
                    </div>
                    <p className="text-xs text-[#10B981] font-semibold m-0 mt-0.5 flex items-center gap-1.5">
                      <Clock size={12} />
                      {cons.dateTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold ${
                    cons.status === 'Completed'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                  }`}>
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
                      Reason for Consultation & Symptoms Reported
                    </span>
                    <p className="text-xs text-[#E8EAF6] m-0 bg-[#13161F] p-3 rounded-xl border border-[#1E2133]">
                      {cons.reasonForConsultation}
                    </p>
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

                      <div>
                        <span className="text-[0.68rem] font-bold text-[#10B981] uppercase block mb-0.5">
                          Clinical Assessment & Findings
                        </span>
                        <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
                          {cons.assessment}
                        </p>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold text-[#FBBF24] uppercase block mb-0.5">
                          Actionable Recommendations & Exercise Prescriptions
                        </span>
                        <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
                          {cons.advice}
                        </p>
                      </div>

                      {cons.suggestedTests && (
                        <div>
                          <span className="text-[0.68rem] font-bold text-[#F472B6] uppercase block mb-1">
                            Suggested Diagnostic Tests
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cons.suggestedTests.map((test, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md bg-[#F472B6]/15 text-[#F472B6] text-[0.7rem] font-semibold border border-[#F472B6]/30">
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex items-center justify-between gap-3 text-[#38BDF8]">
                      <span>Encrypted Video Room opens 10 minutes prior to session.</span>
                      <button
                        onClick={() => alert('Video room will open at scheduled appointment time.')}
                        className="px-3 py-1.5 rounded-lg bg-[#38BDF8] text-black font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Join Video Call
                      </button>
                    </div>
                  )}

                  {/* Action Bar */}
                  {cons.reportUrl && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#1E2133]">
                      <span className="text-[#8B91B0]">Auto-generated consultation summary document</span>
                      <button
                        onClick={() => alert('Downloading official clinical summary PDF...')}
                        className="text-[#10B981] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} />
                        Download Consultation Report PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
