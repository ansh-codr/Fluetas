'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getUserConsultations,
  cancelConsultation,
  rescheduleConsultation,
  ConsultationData,
} from '@/lib/services/consultationService';
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
  Calendar,
  X,
  FileEdit,
  Trash2,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
  '05:30 PM',
  '06:30 PM',
];

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reschedule / Edit Modal State
  const [editingCons, setEditingCons] = useState<ConsultationData | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Cancel Modal State
  const [cancellingCons, setCancellingCons] = useState<ConsultationData | null>(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openRescheduleModal = (cons: ConsultationData) => {
    setEditingCons(cons);
    setEditDate(cons.preferredDate || new Date().toISOString().split('T')[0]);
    setEditTime(cons.preferredTime || '10:00 AM');
    setEditReason(cons.reason || '');
    setEditSymptoms(cons.symptomsReported || []);
    setEditError(null);
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingCons?.id) return;
    if (!editDate) {
      setEditError('Please select an appointment date.');
      return;
    }
    if (!editReason.trim()) {
      setEditError('Please provide a reason for the consultation.');
      return;
    }

    setSubmittingEdit(true);
    setEditError(null);

    try {
      await rescheduleConsultation(user.uid, editingCons.id, {
        expertId: editingCons.expertId,
        preferredDate: editDate,
        preferredTime: editTime,
        reason: editReason,
        symptomsReported: editSymptoms,
      });
      showToast('Consultation details and timing updated successfully!');
      setEditingCons(null);
      await load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update consultation.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openCancelModal = (cons: ConsultationData) => {
    setCancellingCons(cons);
    setCancelReason('Schedule conflict');
    setCustomCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!user || !cancellingCons?.id) return;
    setSubmittingCancel(true);
    setCancelError(null);

    const finalReason = cancelReason === 'Other' ? customCancelReason.trim() : cancelReason;

    try {
      await cancelConsultation(user.uid, cancellingCons.id, finalReason);
      showToast('Consultation cancelled.');
      setCancellingCons(null);
      await load();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel consultation.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

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
          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            {tab === 'upcoming' ? 'No upcoming consultations.' : 'No past consultation records.'}
          </h3>
          <p className="text-xs text-[#586151] m-0 mt-1 max-w-sm">
            {tab === 'upcoming'
              ? 'Book an encrypted 1-on-1 session with our certified sports doctors and nutritionists.'
              : 'Completed consultations and clinical reports will appear here.'}
          </p>
          <Link href="/experts" className="btn-primary mt-4 flex items-center gap-2 px-5 py-2.5 text-xs font-bold no-underline shadow-xs">
            <Plus size={14} /> Find an Expert
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map(cons => {
            const isExpanded = expandedId === cons.id;
            const isUpcoming = ['Requested', 'Booked', 'Scheduled', 'In Progress'].includes(cons.status);

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
                        {cons.preferredDate || 'Date to be confirmed'} {cons.preferredTime ? `at ${cons.preferredTime}` : ''}
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

                    {/* Action Controls for Upcoming Appointments */}
                    {isUpcoming && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[rgba(18,22,15,0.08)]">
                        <span className="text-[0.68rem] font-bold text-[#586151] uppercase">
                          Appointment Management
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              openRescheduleModal(cons);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#2E6DA4]/10 border border-[#2E6DA4]/30 text-[#2E6DA4] hover:bg-[#2E6DA4]/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <FileEdit size={13} />
                            <span>Reschedule / Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              openCancelModal(cons);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>Cancel Appointment</span>
                          </button>
                        </div>
                      </div>
                    )}

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
                    {cons.clinicalNotes ? (
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
                    ) : (
                      <div className="p-3 bg-[#2E6DA4]/10 border border-[#2E6DA4]/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#2E6DA4]">
                        <span>Encrypted telehealth room link will activate when appointment time is confirmed.</span>
                        <button
                          onClick={() => alert(`Your appointment with ${cons.expertName} is scheduled for ${cons.preferredDate || 'date pending'} at ${cons.preferredTime || '10:00 AM'}.`)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E6DA4] text-white font-bold text-xs shrink-0 cursor-pointer"
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

      {/* ── Reschedule / Edit Modal ── */}
      {editingCons && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-[rgba(18,22,15,0.15)] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[0.68rem] font-bold text-[#2E7D32] uppercase tracking-wider">
                  Update Appointment
                </span>
                <h3 className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">
                  {editingCons.expertName}
                </h3>
                <p className="text-xs text-[#586151] m-0">{editingCons.specialization}</p>
              </div>
              <button
                onClick={() => setEditingCons(null)}
                className="text-[#8A9482] hover:text-[#12160F] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReschedule} className="space-y-3.5 text-xs">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#12160F] block mb-1">Appointment Date</label>
                  <div className="flex items-center gap-2 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl px-3 py-2">
                    <Calendar size={14} className="text-[#586151]" />
                    <input
                      type="date"
                      value={editDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setEditDate(e.target.value)}
                      className="w-full bg-transparent outline-none text-xs text-[#12160F]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#12160F] block mb-1">Preferred Time Slot</label>
                  <select
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl px-3 py-2.5 text-xs text-[#12160F] outline-none focus:border-[#2E7D32]"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="font-bold text-[#12160F] block mb-1">
                  Reason for Consultation / Primary Concern
                </label>
                <textarea
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl outline-none text-xs text-[#12160F] focus:border-[#2E7D32]"
                  placeholder="Describe your current symptoms or purpose for this clinical session..."
                  required
                />
              </div>

              {/* Symptoms reported */}
              <div>
                <label className="font-bold text-[#12160F] block mb-1">Reported Symptoms</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editSymptoms.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#2E6DA4]/10 text-[#2E6DA4] text-[0.68rem] font-bold border border-[#2E6DA4]/20 flex items-center gap-1.5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setEditSymptoms(editSymptoms.filter((_, idx) => idx !== i))}
                        className="hover:text-red-600"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={e => setCustomSymptom(e.target.value)}
                    placeholder="Add symptom (e.g. Knee Ache, Fatigue)..."
                    className="flex-1 px-3 py-1.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSymptom.trim() && !editSymptoms.includes(customSymptom.trim())) {
                        setEditSymptoms([...editSymptoms, customSymptom.trim()]);
                        setCustomSymptom('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-[#2E7D32] font-bold text-xs hover:bg-[#2E7D32]/20"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
                <button
                  type="button"
                  onClick={() => setEditingCons(null)}
                  className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151] hover:bg-[#FAFAF6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary px-5 py-2 font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingEdit ? 'Saving Changes...' : 'Save & Confirm Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Cancel Appointment Confirmation Modal ── */}
      {cancellingCons && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-red-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                  Cancel Appointment?
                </h3>
              </div>
              <button
                onClick={() => setCancellingCons(null)}
                className="text-[#8A9482] hover:text-[#12160F] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#586151] m-0 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <strong>{cancellingCons.expertName}</strong> scheduled for{' '}
              <strong>{cancellingCons.preferredDate}</strong> at{' '}
              <strong>{cancellingCons.preferredTime || '10:00 AM'}</strong>?
            </p>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
                {cancelError}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#12160F] block">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl outline-none"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Symptoms improved">Symptoms improved</option>
                <option value="Seeking alternate specialist">Seeking alternate specialist</option>
                <option value="Other">Other reason</option>
              </select>

              {cancelReason === 'Other' && (
                <input
                  type="text"
                  value={customCancelReason}
                  onChange={e => setCustomCancelReason(e.target.value)}
                  placeholder="Please specify reason..."
                  className="w-full p-2.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl outline-none mt-2"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingCons(null)}
                className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-xs text-[#586151] hover:bg-[#FAFAF6] cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={submittingCancel}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {submittingCancel ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
