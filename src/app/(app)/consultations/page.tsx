'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getUserConsultations,
  cancelConsultation,
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
  X,
  Trash2,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:30 AM',
  '02:00 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM',
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

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const load = async (quiet = false) => {
    if (!user) { setLoading(false); return; }
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getUserConsultations(user.uid);
      setConsultations(res);
      if (!quiet && res.length > 0) setExpandedId(res[0].id || null);
    } catch {} finally {
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

  const handleCancel = async (cons: ConsultationData) => {
    if (!user || !cons.id) return;
    setSubmittingCancel(true);
    try {
      await cancelConsultation(user.uid, cons.id, 'Cancelled by patient');
      showToast('Consultation cancelled.');
      setCancellingId(null);
      await load();
    } catch {} finally { setSubmittingCancel(false); }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">My Consultations</h1>
          <p className="text-[#586151] text-xs m-0 mt-0.5">Your consultation history and clinical notes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(true)} disabled={refreshing}
            className="p-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#2E7D32] cursor-pointer">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Link href="/experts" className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold flex items-center gap-1.5 no-underline">
            <Plus size={15} /> Book New
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
          { id: 'past', label: `Past (${pastList.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === t.id ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#586151] border border-[rgba(18,22,15,0.10)]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-[#F2F4EE] rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[rgba(18,22,15,0.08)]">
          <Stethoscope size={26} className="text-[#2E7D32] mx-auto mb-3" />
          <p className="font-bold text-[#12160F] m-0">
            {tab === 'upcoming' ? 'No upcoming consultations.' : 'No past consultations.'}
          </p>
          <Link href="/experts" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold no-underline">
            <Plus size={14} /> Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(cons => {
            const isExpanded = expandedId === cons.id;
            const isUpcoming = ['Requested', 'Booked', 'Scheduled', 'In Progress'].includes(cons.status);

            return (
              <div key={cons.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-[#2E7D32]/40 shadow-sm' : 'border-[rgba(18,22,15,0.08)] hover:shadow-md'
                }`}>
                {/* Summary */}
                <div onClick={() => cons.id && toggleExpand(cons.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#12160F] m-0">{cons.expertName}</p>
                      <p className="text-xs text-[#586151] m-0">{cons.specialization}</p>
                      <p className="text-xs text-[#2E7D32] font-semibold m-0 mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> {cons.preferredDate || 'Date TBC'} {cons.preferredTime ? `at ${cons.preferredTime}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={cons.status} />
                    <ChevronDown size={16} className={`text-[#586151] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="p-4 bg-[#F2F4EE] border-t border-[rgba(18,22,15,0.06)] space-y-3 text-xs">
                    {/* Video Join */}
                    {(cons.status === 'Scheduled' || cons.status === 'In Progress') && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video size={14} className="text-blue-600" />
                          <span className="text-blue-700 font-bold">Ready to join?</span>
                        </div>
                        <a href={getJitsiRoom(cons.id!)} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 no-underline">
                          Join <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {/* Cancel button for upcoming */}
                    {isUpcoming && (
                      <button onClick={(e) => { e.stopPropagation(); setCancellingId(cons.id!); }}
                        className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold cursor-pointer hover:bg-red-100">
                        Cancel Appointment
                      </button>
                    )}

                    {/* Reason */}
                    <div>
                      <span className="text-[0.65rem] font-bold text-[#586151] uppercase block mb-1">Reason</span>
                      <p className="text-[#12160F] m-0 bg-white p-2.5 rounded-lg border border-[rgba(18,22,15,0.06)]">{cons.reason}</p>
                    </div>

                    {/* Clinical Notes */}
                    {cons.clinicalNotes && (
                      <div className="bg-white p-3 rounded-lg border border-[rgba(18,22,15,0.06)] space-y-2">
                        <p className="font-bold text-[#12160F] m-0 flex items-center gap-1"><FileText size={13} /> Clinical Notes</p>
                        <p className="text-[#586151] m-0">{cons.clinicalNotes}</p>
                        {cons.advice && <p className="text-[#586151] m-0"><strong>Advice:</strong> {cons.advice}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Cancel Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="font-bold text-[#12160F] m-0 mb-2">Cancel Appointment?</h3>
            <p className="text-xs text-[#586151] m-0 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCancellingId(null)}
                className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] cursor-pointer">
                Keep
              </button>
              <button onClick={() => {
                const cons = consultations.find(c => c.id === cancellingId);
                if (cons) handleCancel(cons);
              }} disabled={submittingCancel}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {submittingCancel ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
