'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

const mockAdminConsultations = [
  {
    id: 'cons_op_1',
    customerName: 'Rahul Mehta',
    doctorName: 'Dr. Rajesh Sharma',
    specialization: 'Sports Medicine & Ortho',
    scheduledFor: 'Today · 04:30 PM',
    status: 'Scheduled',
    fee: '₹1,500',
    payoutStatus: 'Escrow',
  },
  {
    id: 'cons_op_2',
    customerName: 'Priya Sharma',
    doctorName: 'Dr. Rajesh Sharma',
    specialization: 'Sports Medicine & Ortho',
    scheduledFor: 'Today · 06:00 PM',
    status: 'Scheduled',
    fee: '₹1,500',
    payoutStatus: 'Escrow',
  },
  {
    id: 'cons_op_3',
    customerName: 'Rahul Mehta',
    doctorName: 'Dr. Rajesh Sharma',
    specialization: 'Sports Medicine & Ortho',
    scheduledFor: '24 Aug 2026',
    status: 'Completed',
    fee: '₹1,500',
    payoutStatus: 'Settled',
  },
];

export default function AdminConsultationsPage() {
  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={20} className="text-[#FBBF24]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              CONSULTATIONS OPERATIONAL OVERSIGHT
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Platform-level session scheduling, provider attendance, and settlement status.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="fluetas-card p-5 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2133] text-[#8B91B0] uppercase text-[0.65rem] tracking-wider">
              <th className="pb-3 font-semibold">Customer / Patient</th>
              <th className="pb-3 font-semibold">Consulting Provider</th>
              <th className="pb-3 font-semibold">Session Date</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Platform Fee</th>
              <th className="pb-3 font-semibold text-right">Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2133]">
            {mockAdminConsultations.map(cons => (
              <tr key={cons.id} className="hover:bg-[#13161F]/50 transition-colors">
                <td className="py-3.5 pr-3 font-bold text-[#E8EAF6]">
                  {cons.customerName}
                </td>
                <td className="py-3.5 pr-3 text-[#38BDF8]">
                  {cons.doctorName}
                </td>
                <td className="py-3.5 pr-3 text-[#8B91B0]">{cons.scheduledFor}</td>
                <td className="py-3.5 pr-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                      cons.status === 'Completed'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8]'
                    }`}
                  >
                    {cons.status}
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-mono text-[#E8EAF6]">{cons.fee}</td>
                <td className="py-3.5 text-right">
                  <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#1E2133] text-[#8B91B0]">
                    {cons.payoutStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
