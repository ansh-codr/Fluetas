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
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-3.5 rounded-xl bg-[#10B981] text-black text-xs font-bold shadow-2xl animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#38BDF8]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              PRACTITIONER VERIFICATION &amp; APPLICATIONS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Review clinical licenses, qualification credentials, availability calendars, and approve practitioners for public booking.
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'pending', label: 'Pending Review', count: counts.pending, color: 'text-amber-400' },
          { id: 'under_review', label: 'Under Review', count: counts.under_review, color: 'text-blue-400' },
          { id: 'verified', label: 'Verified & Active', count: counts.verified, color: 'text-[#10B981]' },
          { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-400' },
          { id: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-zinc-400' },
          { id: 'all', label: 'All Applications', count: practitioners.length, color: 'text-white' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as VerificationTab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filter === tab.id
                ? 'bg-white text-[#12160F] shadow-sm'
                : 'bg-[#13161F] text-[#8B91B0] hover:text-white border border-[#1E2133]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#1E2133] ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="fluetas-card p-3.5 flex items-center gap-3">
        <Search size={16} className="text-[#8B91B0] shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by practitioner name, medical specialization, council number..."
          className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#E8EAF6] w-full"
        />
      </div>

      {/* Applications List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#38BDF8]" />
            Loading practitioner applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
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
                className="fluetas-card p-5 border border-[#1E2133] hover:border-[#2A2F45] transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E2133] text-[#38BDF8] flex items-center justify-center font-bold text-sm shrink-0">
                      {item.name ? item.name[0] : 'Dr'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Outfit'] text-base font-bold text-white m-0">
                          {item.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                          status === 'verified'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : status === 'rejected'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : status === 'suspended'
                            ? 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
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
                        className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
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
                        className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    )}
                    {status === 'verified' && (
                      <button
                        onClick={() => handleUpdateStatus(item, 'suspended', 'Administrative suspension')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Ban size={13} />
                        <span>Suspend</span>
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg text-[#8B91B0] hover:text-white bg-[#1A1E2E] cursor-pointer"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#1E2133] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#E8EAF6] m-0 text-xs">Professional Registration</h4>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Council Reg #:</span> {item.credentials || 'Pending verification'}
                      </p>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Experience:</span> {item.experience || 'Not specified'}
                      </p>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Bio:</span> {item.bio || 'None provided'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-[#E8EAF6] m-0 text-xs">Consultation Setup</h4>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Consultation Type:</span> {item.consultationType || 'Telehealth'}
                      </p>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Session Duration:</span> {item.durationMinutes || 30} minutes
                      </p>
                      <p className="text-[#8B91B0] m-0">
                        <span className="text-white font-semibold">Working Days:</span> {Array.isArray(item.workingDays) ? item.workingDays.join(', ') : 'Mon-Fri'}
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#13161F] border border-[#2A2F45] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="font-['Outfit'] text-lg font-bold m-0 mb-1">
              {activeModal === 'reject' ? 'Reject Practitioner Application' : 'Request Application Correction'}
            </h3>
            <p className="text-xs text-[#8B91B0] m-0 mb-4">
              Applicant: <span className="text-white font-bold">{modalTarget.name}</span>
            </p>

            <label className="block text-xs font-semibold text-[#8B91B0] mb-1.5">
              {activeModal === 'reject' ? 'Mandatory Rejection Reason' : 'Requested Corrections & Notes'}
            </label>
            <textarea
              rows={3}
              required
              value={reasonInput}
              onChange={e => setReasonInput(e.target.value)}
              placeholder={activeModal === 'reject' ? 'State clear reason for rejection...' : 'Specify which documents or info need updating...'}
              className="w-full p-3 rounded-xl bg-[#0E111A] border border-[#2A2F45] text-white text-xs outline-none focus:border-amber-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalTarget(null);
                  setReasonInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B91B0] hover:text-white cursor-pointer"
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
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
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
