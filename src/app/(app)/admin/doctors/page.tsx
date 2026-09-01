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
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [search, setSearch] = useState('');
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

      setToastMessage(`Doctor status updated to ${status.toUpperCase()} for ${docItem.name}`);
      setTimeout(() => setToastMessage(null), 3500);
      await loadDoctors();
    } catch (err) {
      alert('Failed to update doctor verification status');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = doctors.filter(d => {
    const matchesFilter = filter === 'all' || d.verificationStatus === filter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
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
              DOCTOR VERIFICATION &amp; CREDENTIALS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Review submitted medical degrees, state licenses, and authorize doctor bookability.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-[#8B91B0] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctors by name or specialty..."
            className="bg-transparent border-none outline-none text-xs text-[#E8EAF6] w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0B0D14] p-1 rounded-xl border border-[#1E2133] overflow-x-auto">
          {(['all', 'pending', 'verified', 'suspended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[#38BDF8] text-black font-bold'
                  : 'text-[#8B91B0] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-[#1E2133]/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="fluetas-card p-10 text-center text-xs text-[#8B91B0]">
          No doctor applications matching the selected criteria.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(doc => {
            const isPending = doc.verificationStatus === 'pending';
            const isVerified = doc.verificationStatus === 'verified';
            const isSuspended = doc.verificationStatus === 'suspended';
            const isProcessing = processingId === doc.id;

            return (
              <div
                key={doc.id}
                className="fluetas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2A3050] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-bold flex items-center justify-center text-lg shadow-lg shrink-0">
                    {doc.name[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                        {doc.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                          isVerified
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : isPending
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {doc.verificationStatus}
                      </span>
                    </div>

                    <p className="text-xs text-[#38BDF8] font-semibold m-0 mt-0.5">
                      {doc.specialization} · {doc.credentials} · {doc.experience}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[0.68rem] text-[#8B91B0]">Documents on File:</span>
                      {doc.verificationDocuments?.map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-[#0B0D14] border border-[#1E2133] text-[0.62rem] text-[#E8EAF6] flex items-center gap-1">
                          <FileCheck size={11} className="text-[#10B981]" /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(doc, 'rejected')}
                        disabled={isProcessing}
                        className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(doc, 'verified')}
                        disabled={isProcessing}
                        className="btn-primary bg-[#10B981] text-black hover:bg-[#10B981]/90 px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
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
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Suspend Access
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleUpdateStatus(doc, 'verified')}
                      disabled={isProcessing}
                      className="btn-primary bg-[#10B981] text-black hover:bg-[#10B981]/90 px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      Reactivate Doctor
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
