'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserConsultations, ConsultationData } from '@/lib/services/consultationService';
import {
  Stethoscope,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  ShieldCheck,
  Video,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarClock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

function getJitsiRoom(consultationId: string) {
  return `https://meet.jit.si/fluetas-consult-${consultationId}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Requested: 'bg-amber-50 text-amber-700 border-amber-200',
    Booked: 'bg-amber-50 text-amber-700 border-amber-200',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
    Completed: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
    'Report Generated': 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
    'Follow-up Required': 'bg-orange-50 text-orange-700 border-orange-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold border ${map[status] || 'bg-[#F2F4EE] text-[#586151] border-[rgba(18,22,15,0.10)]'}`}>
      {status}
    </span>
  );
}

function ConsultationActionPanel({ cons }: { cons: ConsultationData }) {
  const id = cons.id!;

  if (cons.status === 'Scheduled' || cons.status === 'In Progress') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Video size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-700 m-0">Your consultation is scheduled</p>
            <p className="text-[0.68rem] text-blue-600 m-0 mt-0.5">
              Click "Join Session" at your appointment time. Both you and your doctor will use this link.
            </p>
          </div>
        </div>
        <a
          href={getJitsiRoom(id)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors no-underline"
        >
          <Video size={13} />
          Join Session
          <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  if (cons.status === 'Booked' || cons.status === 'Requested') {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
        <CalendarClock size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700 m-0">Awaiting doctor confirmation</p>
          <p className="text-[0.68rem] text-amber-600 m-0 mt-0.5">
            Your booking is received. Once your doctor confirms the appointment, a "Join Session" button will appear here.
            Check back or refresh this page.
          </p>
        </div>
      </div>
    );
  }

  if (cons.status === 'Completed' || cons.status === 'Report Generated') {
    return (
      <div className="p-4 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-xl flex items-start gap-2.5">
        <CheckCircle2 size={16} className="text-[#2E7D32] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#2E7D32] m-0">Session complete</p>
          <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
            Your clinical notes and recommendations from this session are shown above.
          </p>
        </div>
      </div>
    );
  }

  if (cons.status === 'Cancelled') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
        <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-600 m-0">This consultation was cancelled. You can book a new one anytime.</p>
      </div>
    );
  }

  return null;
}

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async (quiet = false) => {
    if (!user) { setLoading(false); return; }
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getUserConsultations(user.uid);
      setConsultations(res);
      if (!quiet && res.length > 0) setExpandedId(res[0].id || null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const upcomingList = consultations.filter(c =>
    ['Requested', 'Booked', 'Scheduled', 'In Progress'].includes(c.status)
  );
  const pastList = consultations.filter(c =>
    ['Completed', 'Report Generated', 'Follow-up Required', 'Cancelled'].includes(c.status)
  );
  const filtered = tab === 'upcoming' ? upcomingList : pastList;

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            MY CONSULTATIONS &amp; CLINICAL NOTES
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Encrypted telehealth sessions, clinical assessments, and auto-generated medical summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            title="Refresh status"
            className="p-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#2E7D32] hover:border-[#2E7D32]/30 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/experts"
            className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 no-underline"
          >
            <Plus size={15} />
            Book New Consultation
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(18,22,15,0.10)] gap-2">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
          { id: 'past', label: `Past Sessions & Reports (${pastList.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
              tab === t.id
                ? 'text-[#2E7D32] border-[#2E7D32]'
                : 'text-[#586151] border-transparent hover:text-[#12160F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F2F4EE] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="fluetas-card p-10 text-center flex flex-col items-center justify-center bg-white border border-[rgba(18,22,15,0.08)] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
            <Stethoscope size={26} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">No consultations yet.</h3>
          <p className="text-xs text-[#586151] m-0 mt-1 max-w-sm">
            Your upcoming and completed consultations will appear here.
          </p>
          <Link href="/experts" className="btn-primary mt-4 flex items-center gap-2 px-5 py-2.5 text-xs font-bold no-underline shadow-xs">
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
                className={`fluetas-card transition-all overflow-hidden ${isExpanded ? 'border-[#2E7D32]/40 shadow-sm' : 'hover:shadow-md'}`}
              >
                {/* Summary bar */}
                <div
                  onClick={() => cons.id && toggleExpand(cons.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-white"
                >
                  <div className="flex items-center gap-3.5">
                    {cons.expertName?.toLowerCase().includes('swati') ? (
                      <img
                        src="/assets/dr-swati-dixit-square.jpg"
                        alt={cons.expertName}
                        className="w-11 h-11 rounded-xl object-cover object-top shrink-0 border border-[rgba(18,22,15,0.12)] shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                        <Stethoscope size={22} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">{cons.expertName}</h3>
                        <span className="text-xs text-[#586151]">· {cons.specialization}</span>
                      </div>
                      <p className="text-xs text-[#2E7D32] font-semibold m-0 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} />
                        {cons.preferredDate || 'Date TBC'} {cons.preferredTime ? `at ${cons.preferredTime}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <StatusBadge status={cons.status} />
                    <button className="text-[#586151] hover:text-[#12160F] p-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="p-5 bg-[#F2F4EE] border-t border-[rgba(18,22,15,0.08)] flex flex-col gap-4 text-xs animate-slide-up">

                    {/* Action panel (join/status) */}
                    <ConsultationActionPanel cons={cons} />

                    {/* Reason */}
                    <div>
                      <span className="text-[0.68rem] font-bold text-[#586151] uppercase block mb-1">
                        Reason for Consultation
                      </span>
                      <p className="text-xs text-[#12160F] m-0 bg-white p-3 rounded-xl border border-[rgba(18,22,15,0.08)]">
                        {cons.reason}
                      </p>
                    </div>

                    {/* Symptoms */}
                    {cons.symptomsReported && cons.symptomsReported.length > 0 && (
                      <div>
                        <span className="text-[0.68rem] font-bold text-[#586151] uppercase block mb-1">
                          Reported Symptoms
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cons.symptomsReported.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-[#2E6DA4]/10 text-[#2E6DA4] text-[0.7rem] font-semibold border border-[#2E6DA4]/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Consent */}
                    <div className="p-3 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-xl flex items-center gap-2 text-[#2E7D32]">
                      <ShieldCheck size={16} className="shrink-0" />
                      <span>Encrypted health record consent granted for this provider.</span>
                    </div>

                    {/* Clinical notes (if completed) */}
                    {cons.clinicalNotes && (
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-[rgba(18,22,15,0.08)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText size={14} className="text-[#2E6DA4]" />
                          <span className="text-xs font-bold text-[#12160F]">Doctor's Clinical Notes</span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold text-[#2E6DA4] uppercase block mb-0.5">
                            Clinical Examination Notes
                          </span>
                          <p className="text-xs text-[#12160F] m-0 leading-relaxed">{cons.clinicalNotes}</p>
                        </div>

                        {cons.assessment && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-[#2E7D32] uppercase block mb-0.5">
                              Assessment &amp; Findings
                            </span>
                            <p className="text-xs text-[#12160F] m-0 leading-relaxed">{cons.assessment}</p>
                          </div>
                        )}

                        {cons.advice && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-amber-600 uppercase block mb-0.5">
                              Recommendations &amp; Advice
                            </span>
                            <p className="text-xs text-[#12160F] m-0 leading-relaxed">{cons.advice}</p>
                          </div>
                        )}

                        {cons.suggestedTests && cons.suggestedTests.length > 0 && (
                          <div>
                            <span className="text-[0.68rem] font-bold text-[#C23B6B] uppercase block mb-1">
                              Suggested Diagnostic Tests
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cons.suggestedTests.map((test, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-md bg-[#C23B6B]/10 text-[#C23B6B] text-[0.7rem] font-semibold border border-[#C23B6B]/20">
                                  {test}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
