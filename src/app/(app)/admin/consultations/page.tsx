'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  Video,
  ShieldCheck,
} from 'lucide-react';

interface AdminAppointmentItem {
  id: string;
  customerId: string;
  customerName?: string;
  expertId: string;
  expertName: string;
  date: string;
  time: string;
  status: string;
  consultationType: string;
  reason: string;
}

export default function AdminConsultationsPage() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    getDocs(query(collection(db, 'appointments')))
      .then(snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminAppointmentItem));
        setAppointments(list);
        setLoading(false);
      })
      .catch(err => {
        console.warn('[AdminConsultations] Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = appointments.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (a.customerName && a.customerName.toLowerCase().includes(q)) ||
      (a.expertName && a.expertName.toLowerCase().includes(q)) ||
      (a.status && a.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#D9622B]/10 text-[#D9622B] flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              CONSULTATIONS OPERATIONAL OVERSIGHT
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Platform-level session scheduling, provider appointments, and clinical volume logs.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="fluetas-card p-3.5 flex items-center gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <Search size={15} className="text-[#8A9482] shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name, practitioner name, status..."
          className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#12160F] placeholder-[#8A9482] w-full"
        />
      </div>

      {/* Table */}
      <div className="fluetas-card p-5 overflow-x-auto bg-white border border-[rgba(18,22,15,0.08)]">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#586151]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#D9622B]" />
            Loading consultations telemetry...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#586151]">
            No platform appointments on record. Customer booked sessions will appear here in real time.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold">
                <th className="pb-3">Patient / Customer</th>
                <th className="pb-3">Consulting Practitioner</th>
                <th className="pb-3">Session Schedule</th>
                <th className="pb-3">Consultation Type</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
              {filtered.map(cons => (
                <tr key={cons.id} className="hover:bg-[#FAFAF6] transition-colors">
                  <td className="py-3.5 pr-3 font-bold text-[#12160F]">
                    {cons.customerName || 'Patient'}
                  </td>
                  <td className="py-3.5 pr-3 text-[#2E6DA4] font-bold">
                    {cons.expertName || 'Practitioner'}
                  </td>
                  <td className="py-3.5 pr-3 text-[#586151] font-mono text-xs">
                    {cons.date} · {cons.time}
                  </td>
                  <td className="py-3.5 pr-3 text-[#12160F]">
                    <span className="flex items-center gap-1.5">
                      <Video size={13} className="text-[#8A9482]" />
                      {cons.consultationType || 'Telehealth'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                        cons.status === 'Completed'
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                          : 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20'
                      }`}
                    >
                      {cons.status || 'Booked'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
