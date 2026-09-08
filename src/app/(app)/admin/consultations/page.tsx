'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllAppointments,
  updateAppointmentStatus,
  AppointmentRecord,
} from '@/lib/services/consultationService';
import {
  Calendar,
  Search,
  Loader2,
  Video,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Booked', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_STYLES: Record<string, string> = {
  Booked: 'bg-amber-50 text-amber-700 border-amber-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function getJitsiRoom(id: string) {
  return `https://meet.jit.si/fluetas-consult-${id}`;
}

export default function AdminConsultationsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getAllAppointments();
      setAppointments(res);
    } catch (err) {
      console.warn('[AdminConsultations]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleForceConfirm = async (appt: AppointmentRecord) => {
    setProcessingId(appt.id);
    try {
      await updateAppointmentStatus(appt.id, appt.customerId, 'Scheduled');
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Scheduled' } : a));
    } catch (err: any) {
      alert(err.message || 'Failed to confirm');
    } finally {
      setProcessingId(null);
    }
  };

  const handleForceCancel = async (appt: AppointmentRecord) => {
    if (!confirm(`Cancel ${appt.customerName}'s appointment with ${appt.expertName}?`)) return;
    setProcessingId(appt.id);
    try {
      await updateAppointmentStatus(appt.id, appt.customerId, 'Cancelled');
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Cancelled' } : a));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setProcessingId(null);
    }
  };

  // Stats
  const stats = {
    total: appointments.length,
    booked: appointments.filter(a => a.status === 'Booked').length,
    scheduled: appointments.filter(a => a.status === 'Scheduled').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };

  const filtered = appointments.filter(a => {
    const matchSearch = !search.trim() ||
      (a.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.expertName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#D9622B]/10 text-[#D9622B] flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              CONSULTATIONS OPERATIONAL OVERSIGHT
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Platform-wide session scheduling, provider appointments, and clinical volume logs.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-xs font-bold text-[#586151] hover:text-[#2E7D32] hover:border-[#2E7D32]/30 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#12160F]', bg: 'bg-[#F2F4EE]' },
          { label: 'Pending Confirm', value: stats.booked, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10' },
        ].map(s => (
          <div key={s.label} className={`fluetas-card p-4 ${s.bg} border border-[rgba(18,22,15,0.08)]`}>
            <p className="text-[0.65rem] font-bold text-[#586151] uppercase tracking-wider m-0">{s.label}</p>
            <p className={`font-['Outfit'] text-2xl font-black m-0 mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="fluetas-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search size={15} className="text-[#8A9482] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient, doctor, or reason..."
            className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#12160F] placeholder-[#8A9482] w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-[#8A9482] shrink-0" />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#D9622B] text-white'
                  : 'bg-[#F2F4EE] text-[#586151] hover:text-[#12160F]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="fluetas-card bg-white border border-[rgba(18,22,15,0.08)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#586151]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#D9622B]" />
            Loading consultations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#586151]">
            No appointments match your filters. Booked sessions will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold bg-[#FAFAF6]">
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Practitioner</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
                {filtered.map(cons => {
                  const isProcessing = processingId === cons.id;
                  return (
                    <tr key={cons.id} className="hover:bg-[#FAFAF6] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-[#12160F] m-0">{cons.customerName || 'Patient'}</p>
                        <p className="text-[0.65rem] text-[#8A9482] font-mono m-0 mt-0.5 truncate max-w-[140px]">{cons.customerId}</p>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#2E6DA4]">
                        {cons.expertName || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[#586151] font-mono">
                        <p className="m-0">{cons.date}</p>
                        <p className="m-0 text-[#8A9482]">{cons.time}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase border ${STATUS_STYLES[cons.status] || 'bg-[#F2F4EE] text-[#586151] border-[rgba(18,22,15,0.10)]'}`}>
                          {cons.status || 'Booked'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Force Confirm */}
                          {cons.status === 'Booked' && (
                            <button
                              onClick={() => handleForceConfirm(cons)}
                              disabled={isProcessing}
                              title="Force confirm this appointment"
                              className="px-2.5 py-1.5 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-[#2E7D32]/20 border border-[#2E7D32]/20 text-[0.65rem] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {isProcessing ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                              Confirm
                            </button>
                          )}

                          {/* Session link */}
                          {(cons.status === 'Scheduled' || cons.status === 'In Progress') && (
                            <a
                              href={getJitsiRoom(cons.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open session room"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[0.65rem] font-bold flex items-center gap-1 no-underline transition-colors"
                            >
                              <Video size={11} />
                              Session
                              <ExternalLink size={10} />
                            </a>
                          )}

                          {/* View patient */}
                          <Link
                            href={`/doctor/patients/${cons.customerId}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F2F4EE] text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.10)] text-[0.65rem] font-bold no-underline transition-colors"
                          >
                            Chart
                          </Link>

                          {/* Cancel */}
                          {cons.status !== 'Completed' && cons.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleForceCancel(cons)}
                              disabled={isProcessing}
                              title="Cancel this appointment"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
