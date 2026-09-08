'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  addClinicalNotes,
  AppointmentRecord,
  ClinicalNotesPayload,
} from '@/lib/services/consultationService';
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Video,
  Loader2,
  CheckCircle2,
  FileText,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';

function getJitsiRoom(appointmentId: string) {
  return `https://meet.jit.si/fluetas-consult-${appointmentId}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Booked: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
    Scheduled: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
    'In Progress': 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    Completed: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
    Cancelled: 'bg-red-900/30 text-red-400 border-red-700/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase border ${map[status] || 'bg-[#1E2133] text-[#8B91B0] border-[#2A2E45]'}`}>
      {status}
    </span>
  );
}

interface NotesModal {
  appointmentId: string;
  customerId: string;
  customerName: string;
}

export default function DoctorConsultationsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Clinical notes modal
  const [notesModal, setNotesModal] = useState<NotesModal | null>(null);
  const [notes, setNotes] = useState('');
  const [assessment, setAssessment] = useState('');
  const [advice, setAdvice] = useState('');
  const [testsInput, setTestsInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  const load = async () => {
    if (!user?.uid) { setLoading(false); return; }
    try {
      const res = await getDoctorAppointments(user.uid);
      setAppointments(res || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.uid]);

  const handleConfirm = async (appt: AppointmentRecord) => {
    setProcessingId(appt.id);
    try {
      await updateAppointmentStatus(appt.id, appt.customerId, 'Scheduled');
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Scheduled' } : a));
    } catch (err: any) {
      alert(err.message || 'Failed to confirm appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (appt: AppointmentRecord) => {
    if (!confirm(`Cancel appointment with ${appt.customerName}?`)) return;
    setProcessingId(appt.id);
    try {
      await updateAppointmentStatus(appt.id, appt.customerId, 'Cancelled');
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Cancelled' } : a));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesModal || !notes.trim()) {
      setNotesError('Clinical notes are required.');
      return;
    }
    setSavingNotes(true);
    setNotesError('');
    try {
      const payload: ClinicalNotesPayload = {
        clinicalNotes: notes.trim(),
        assessment: assessment.trim(),
        advice: advice.trim(),
        suggestedTests: testsInput.split(',').map(t => t.trim()).filter(Boolean),
      };
      await addClinicalNotes(notesModal.appointmentId, notesModal.customerId, payload);
      setAppointments(prev =>
        prev.map(a => a.id === notesModal.appointmentId ? { ...a, status: 'Completed' } : a)
      );
      setNotesModal(null);
      setNotes(''); setAssessment(''); setAdvice(''); setTestsInput('');
    } catch (err: any) {
      setNotesError(err.message || 'Failed to save clinical notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const upcoming = appointments.filter(c => c.status !== 'Completed' && c.status !== 'Cancelled');
  const completed = appointments.filter(c => c.status === 'Completed');
  const filtered = tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#38BDF8]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              CLINICAL CONSULTATION SESSIONS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Active telehealth queue, scheduled sessions, and historical consultation records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2133] pb-2">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'upcoming' ? 'bg-[#38BDF8] text-black shadow-xs' : 'text-[#8B91B0] hover:text-white'
          }`}
        >
          <Clock size={14} />
          Scheduled / In Queue ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'completed' ? 'bg-[#38BDF8] text-black shadow-xs' : 'text-[#8B91B0] hover:text-white'
          }`}
        >
          <Calendar size={14} />
          Completed Sessions ({completed.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#38BDF8]" />
            Loading consultation records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            {tab === 'upcoming'
              ? 'No upcoming consultations scheduled. Booked patient sessions will appear here.'
              : 'No completed consultations on record yet.'}
          </div>
        ) : (
          filtered.map(c => {
            const isProcessing = processingId === c.id;
            return (
              <div
                key={c.id}
                className="fluetas-card p-4 sm:p-5 flex flex-col gap-4 border border-[#1E2133] hover:border-[#38BDF8]/40 transition-colors"
              >
                {/* Top row: patient info + status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E2133] flex items-center justify-center text-[#38BDF8] font-bold text-sm shrink-0">
                      {c.customerName ? c.customerName[0] : 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#E8EAF6] text-sm sm:text-base">
                          {c.customerName || 'Patient'}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-[#8B91B0] m-0 mt-0.5 line-clamp-1">{c.reason}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[0.68rem] text-[#8B91B0]">
                        <span className="flex items-center gap-1 text-white font-medium">
                          <Clock size={12} className="text-[#38BDF8]" />
                          {c.date} · {c.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video size={12} />
                          {c.consultationType}
                        </span>
                        <span className="flex items-center gap-1 text-[#10B981]">
                          <ShieldCheck size={12} />
                          Consent Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View patient chart */}
                  <Link
                    href={`/doctor/patients/${c.customerId}`}
                    className="px-3.5 py-2 rounded-xl bg-[#1E2133] hover:bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto no-underline transition-colors shrink-0"
                  >
                    Patient Chart
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Action buttons row */}
                {c.status !== 'Completed' && c.status !== 'Cancelled' && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#1E2133]">
                    {/* Confirm */}
                    {c.status === 'Booked' && (
                      <button
                        onClick={() => handleConfirm(c)}
                        disabled={isProcessing}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-700/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Confirm Appointment
                      </button>
                    )}

                    {/* Start session (Scheduled or Booked) */}
                    {(c.status === 'Scheduled' || c.status === 'Booked') && (
                      <a
                        href={getJitsiRoom(c.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-bold flex items-center gap-1.5 no-underline transition-colors"
                      >
                        <Video size={12} />
                        Start Session
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {/* Add clinical notes */}
                    {(c.status === 'Scheduled' || c.status === 'In Progress' || c.status === 'Booked') && (
                      <button
                        onClick={() => {
                          setNotesModal({ appointmentId: c.id, customerId: c.customerId, customerName: c.customerName || 'Patient' });
                          setNotes(''); setAssessment(''); setAdvice(''); setTestsInput(''); setNotesError('');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#1E2133] hover:bg-[#2A2E45] text-[#8B91B0] border border-[#2A2E45] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FileText size={12} />
                        Add Clinical Notes
                      </button>
                    )}

                    {/* Cancel */}
                    <button
                      onClick={() => handleCancel(c)}
                      disabled={isProcessing}
                      className="ml-auto px-3.5 py-2 rounded-xl bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Clinical Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F111A] border border-[#1E2133] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2133]">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">Add Clinical Notes</h3>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">Patient: {notesModal.customerName}</p>
              </div>
              <button onClick={() => setNotesModal(null)} className="text-[#8B91B0] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {notesError && (
                <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-xs text-red-400 font-semibold">
                  {notesError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#E8EAF6] mb-1">
                  Clinical Examination Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed findings from the consultation session..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2133] border border-[#2A2E45] text-[#E8EAF6] placeholder-[#4A5068] text-xs focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E8EAF6] mb-1">Assessment &amp; Findings</label>
                <textarea
                  rows={3}
                  placeholder="Clinical assessment, diagnosis, or differential..."
                  value={assessment}
                  onChange={e => setAssessment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2133] border border-[#2A2E45] text-[#E8EAF6] placeholder-[#4A5068] text-xs focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E8EAF6] mb-1">Recommendations &amp; Advice</label>
                <textarea
                  rows={3}
                  placeholder="Treatment plan, lifestyle modifications, prescriptions..."
                  value={advice}
                  onChange={e => setAdvice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2133] border border-[#2A2E45] text-[#E8EAF6] placeholder-[#4A5068] text-xs focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E8EAF6] mb-1">
                  Suggested Diagnostic Tests (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBC, Thyroid Panel, Vitamin D, HbA1c"
                  value={testsInput}
                  onChange={e => setTestsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E2133] border border-[#2A2E45] text-[#E8EAF6] placeholder-[#4A5068] text-xs focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#1E2133] flex items-center justify-between">
              <button
                onClick={() => setNotesModal(null)}
                className="text-xs font-semibold text-[#8B91B0] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes || !notes.trim()}
                className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                {savingNotes ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                {savingNotes ? 'Saving...' : 'Save &amp; Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
