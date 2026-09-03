'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminDoctorsList,
  DoctorApplication,
} from '@/lib/services/adminService';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  ExternalLink,
  MessageSquare,
  Clock,
  Ban,
  ShieldAlert,
  X,
} from 'lucide-react';

type VerificationTab = 'all' | 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';

export default function AdminPractitionersPage() {
  const { user } = useAuth();
  const [practitioners, setPractitioners] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VerificationTab>('pending');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal / Reason state
  const [activeModal, setActiveModal] = useState<'reject' | 'correction' | null>(null);
  const [modalTarget, setModalTarget] = useState<DoctorApplication | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  const loadPractitioners = async () => {
    try {
      const res = await getAdminDoctorsList();
      setPractitioners(res || []);
    } catch (err) {
      console.warn('[AdminPractitioners] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPractitioners();
  }, []);

  const handleUpdateStatus = async (
    target: DoctorApplication,
    status: 'verified' | 'rejected' | 'suspended' | 'under_review' | 'pending',
    notes?: string
  ) => {
    setProcessingId(target.id);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/verify-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          doctorId: target.id,
          doctorName: target.name,
          status,
          notes: notes || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update status');
      }

      setToastMessage(`Practitioner status updated to ${status.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3500);
      setActiveModal(null);
      setModalTarget(null);
      setReasonInput('');
      await loadPractitioners();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = practitioners.filter(p => {
    if (filter !== 'all') {
      const pStatus = (p.verificationStatus || 'pending').toLowerCase();
      if (pStatus !== filter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.specialization && p.specialization.toLowerCase().includes(q)) ||
        (p.credentials && p.credentials.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const counts = {
    pending: practitioners.filter(p => (p.verificationStatus || 'pending') === 'pending').length,
    under_review: practitioners.filter(p => p.verificationStatus === 'under_review').length,
    verified: practitioners.filter(p => p.verificationStatus === 'verified').length,
    rejected: practitioners.filter(p => p.verificationStatus === 'rejected').length,
    suspended: practitioners.filter(p => p.verificationStatus === 'suspended').length,
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-3.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-2xl animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center font-bold">
              <Stethoscope size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              PRACTITIONER VERIFICATION &amp; APPLICATIONS
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Review clinical licenses, qualification credentials, and approve practitioners for public booking.
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'pending', label: 'Pending Review', count: counts.pending, color: 'text-[#D9622B]' },
          { id: 'under_review', label: 'Under Review', count: counts.under_review, color: 'text-[#2E6DA4]' },
          { id: 'verified', label: 'Verified & Active', count: counts.verified, color: 'text-[#2E7D32]' },
          { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-600' },
          { id: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-zinc-600' },
          { id: 'all', label: 'All Applications', count: practitioners.length, color: 'text-[#12160F]' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as VerificationTab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filter === tab.id
                ? 'bg-[#12160F] text-white shadow-xs'
                : 'bg-white text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.08)]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#F2F4EE] ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="fluetas-card p-3.5 flex items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <Search size={15} className="text-[#8A9482] shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by practitioner name, medical specialization, council number..."
          className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#12160F] placeholder-[#8A9482] w-full"
        />
      </div>

      {/* Applications List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#586151] bg-white border border-[rgba(18,22,15,0.08)]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#2E6DA4]" />
            Loading practitioner applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#586151] bg-white border border-[rgba(18,22,15,0.08)]">
            No practitioner applications found under status &ldquo;{filter}&rdquo;.
          </div>
        ) : (
          filtered.map(item => {
            const isExpanded = expandedId === item.id;
            const isProcessing = processingId === item.id;
            const status = (item.verificationStatus || 'pending').toLowerCase();

            return (
              <div
                key={item.id}
                className="fluetas-card p-5 bg-white border border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.20)] transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-[#2E6DA4] flex items-center justify-center font-bold text-sm shrink-0">
                      {item.name ? item.name[0] : 'Dr'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                          {item.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                          status === 'verified'
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/25'
                            : status === 'rejected'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : status === 'suspended'
                            ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                            : 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/25'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-[#586151] m-0 mt-0.5">
                        {item.specialization || 'Clinical Specialist'} · {item.qualification || 'Certified Practitioner'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {status !== 'verified' && (
                      <button
                        onClick={() => handleUpdateStatus(item, 'verified')}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 shadow-2xs"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve</span>
                      </button>
                    )}
                    {status === 'pending' && (
                      <button
                        onClick={() => {
                          setModalTarget(item);
                          setActiveModal('correction');
                        }}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2E6DA4]/10 hover:bg-[#2E6DA4]/20 text-[#2E6DA4] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <MessageSquare size={13} />
                        <span>Correction</span>
                      </button>
                    )}
                    {status !== 'rejected' && status !== 'verified' && (
                      <button
                        onClick={() => {
                          setModalTarget(item);
                          setActiveModal('reject');
                        }}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    )}
                    {status === 'verified' && (
                      <button
                        onClick={() => handleUpdateStatus(item, 'suspended', 'Administrative suspension')}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Ban size={13} />
                        <span>Suspend</span>
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] cursor-pointer"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[rgba(18,22,15,0.08)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-2">
                      <h4 className="font-bold text-[#12160F] m-0 text-xs uppercase tracking-wider text-[0.68rem]">Professional Registration</h4>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Council Reg #:</strong> {item.credentials || 'Pending verification'}
                      </p>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Experience:</strong> {item.experience || 'Not specified'}
                      </p>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Bio:</strong> {item.bio || 'None provided'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-2">
                      <h4 className="font-bold text-[#12160F] m-0 text-xs uppercase tracking-wider text-[0.68rem]">Consultation Setup</h4>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Consultation Type:</strong> {item.consultationType || 'Telehealth Video'}
                      </p>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Session Duration:</strong> {item.durationMinutes || 30} minutes
                      </p>
                      <p className="text-[#586151] m-0">
                        <strong className="text-[#12160F]">Working Days:</strong> {Array.isArray(item.workingDays) ? item.workingDays.join(', ') : 'Mon-Fri'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal for Rejection / Correction Request ─────────────────────── */}
      {activeModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-[#12160F] shadow-2xl border border-[rgba(18,22,15,0.12)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Outfit'] text-lg font-bold m-0 text-[#12160F]">
                {activeModal === 'reject' ? 'Reject Practitioner Application' : 'Request Application Correction'}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setModalTarget(null);
                  setReasonInput('');
                }}
                className="p-1 rounded-lg text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#586151] m-0 mb-4">
              Applicant: <strong className="text-[#12160F]">{modalTarget.name}</strong>
            </p>

            <label className="block text-xs font-bold text-[#12160F] mb-1.5">
              {activeModal === 'reject' ? 'Mandatory Rejection Reason' : 'Requested Corrections & Notes'}
            </label>
            <textarea
              rows={3}
              required
              value={reasonInput}
              onChange={e => setReasonInput(e.target.value)}
              placeholder={activeModal === 'reject' ? 'State clear reason for rejection...' : 'Specify which documents or information need updating...'}
              className="w-full p-3 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#D9622B] mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalTarget(null);
                  setReasonInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reasonInput.trim() || processingId === modalTarget.id}
                onClick={() =>
                  handleUpdateStatus(
                    modalTarget,
                    activeModal === 'reject' ? 'rejected' : 'pending',
                    reasonInput.trim()
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 ${
                  activeModal === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#2E6DA4] hover:bg-[#255885] text-white'
                }`}
              >
                {activeModal === 'reject' ? 'Confirm Rejection' : 'Submit Correction Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
