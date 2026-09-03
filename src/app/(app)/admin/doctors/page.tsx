'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminDoctorsList,
  updateDoctorVerification,
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
} from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

type SortField = 'name' | 'specialization' | 'verificationStatus' | 'experience';
type SortOrder = 'asc' | 'desc';

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const adminId = user?.uid || 'admin_root';

  const loadDoctors = async () => {
    try {
      const res = await getAdminDoctorsList();
      setDoctors(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleUpdateStatus = async (
    docItem: DoctorApplication,
    status: 'verified' | 'rejected' | 'suspended'
  ) => {
    setProcessingId(docItem.id);
    try {
      await updateDoctorVerification({
        doctorId: docItem.id,
        doctorName: docItem.name,
        status,
        adminId,
        reason: status === 'verified' ? 'Credentials and Medical Registration verified' : 'Admin manual review',
      });

      setToastMessage(`Practitioner status updated to ${status.toUpperCase()} for ${docItem.name}`);
      setTimeout(() => setToastMessage(null), 3500);
      await loadDoctors();
    } catch {
      alert('Failed to update practitioner verification status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredDoctors = doctors
    .filter(d => {
      if (filter !== 'all' && d.verificationStatus !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.credentials && d.credentials.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const pendingCount = doctors.filter(d => d.verificationStatus === 'pending').length;

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 p-3.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-lg animate-fade-in">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#2E7D32]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              PRACTITIONER &amp; EXPERT VERIFICATION
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Review submitted credentials, licensing numbers, and authorize practitioner bookability.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 text-xs font-bold self-start sm:self-auto">
            <AlertTriangle size={14} />
            {pendingCount} Pending Applications
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <div className="flex items-center gap-2.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-[#586151] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search experts by name or specialty..."
            className="bg-transparent border-none outline-none text-xs text-[#12160F] w-full"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-[#FAFAF6] p-1 rounded-xl border border-[rgba(18,22,15,0.10)] text-xs text-[#586151]">
            <span className="px-2 text-[0.68rem] font-semibold">Sort:</span>
            <button
              onClick={() => handleSort('name')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${sortField === 'name' ? 'bg-white text-[#12160F] shadow-xs' : 'hover:text-[#12160F]'}`}
            >
              Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => handleSort('verificationStatus')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${sortField === 'verificationStatus' ? 'bg-white text-[#12160F] shadow-xs' : 'hover:text-[#12160F]'}`}
            >
              Status {sortField === 'verificationStatus' && (sortOrder === 'asc' ? '▲' : '▼')}
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAF6] p-1 rounded-xl border border-[rgba(18,22,15,0.10)] overflow-x-auto">
            {(['all', 'pending', 'verified', 'suspended'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#2E7D32] text-white font-bold shadow-xs'
                    : 'text-[#586151] hover:text-[#12160F]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Practitioner List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="fluetas-card p-10 flex flex-col items-center justify-center text-center bg-white border border-[rgba(18,22,15,0.10)] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
            <UserCheck size={28} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            No expert applications found
          </h3>
          <p className="text-xs text-[#586151] max-w-sm mt-1 mb-0 leading-relaxed">
            {search || filter !== 'all'
              ? 'No practitioners match your current filters.'
              : 'There are currently no practitioner applications awaiting review in the database.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredDoctors.map(doc => {
            const isPending = doc.verificationStatus === 'pending';
            const isVerified = doc.verificationStatus === 'verified';
            const isSuspended = doc.verificationStatus === 'suspended';
            const isExpanded = expandedId === doc.id;
            const isProcessing = processingId === doc.id;

            return (
              <div
                key={doc.id}
                className="fluetas-card p-5 bg-white border border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.18)] transition-all rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 flex items-center justify-center font-black text-base shrink-0">
                      {doc.name.replace('Dr. ', '')[0] || 'D'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                          {doc.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${
                            isVerified
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20'
                              : isPending
                              ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20'
                              : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20'
                          }`}
                        >
                          {doc.verificationStatus.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#586151] m-0 mt-0.5">
                        {doc.specialization} · <span className="font-semibold">{doc.credentials}</span> · {doc.experience}
                      </p>

                      {doc.email && (
                        <p className="text-[0.6875rem] text-[#8A9482] m-0 mt-0.5">
                          {doc.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(doc, 'rejected')}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/20 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(doc, 'verified')}
                          disabled={isProcessing}
                          className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                          Approve &amp; Verify
                        </button>
                      </>
                    )}

                    {isVerified && (
                      <button
                        onClick={() => handleUpdateStatus(doc, 'suspended')}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] hover:bg-[#D97706]/20 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Suspend Access
                      </button>
                    )}

                    {isSuspended && (
                      <button
                        onClick={() => handleUpdateStatus(doc, 'verified')}
                        disabled={isProcessing}
                        className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        Reactivate Practitioner
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                      className="p-1.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-[#586151] hover:text-[#12160F] cursor-pointer transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Inline Expansion Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[rgba(18,22,15,0.08)] text-xs space-y-3">
                    {doc.bio && (
                      <p className="text-xs text-[#586151] m-0 leading-relaxed bg-[#FAFAF6] p-3 rounded-xl">
                        <strong>Bio:</strong> {doc.bio}
                      </p>
                    )}

                    {doc.verificationDocuments && doc.verificationDocuments.length > 0 && (
                      <div>
                        <span className="text-[0.6875rem] font-bold text-[#12160F] uppercase block mb-1.5">
                          Submitted Verification Documents:
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {doc.verificationDocuments.map((fn, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-xs text-[#12160F] font-medium"
                            >
                              <FileText size={13} className="text-[#2E7D32]" />
                              {fn}
                            </span>
                          ))}
                        </div>
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
