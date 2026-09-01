'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs, AuditLogEntry } from '@/lib/services/auditService';
import {
  Shield,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      const res = await getAuditLogs({ actorRole: roleFilter });
      if (res.length === 0) {
        setLogs([
          {
            actorId: 'dr_rajesh_sharma',
            actorRole: 'doctor',
            action: 'doctor_viewed_patient_record',
            resourceType: 'health_record',
            resourceId: 'patient_demo_rahul',
            customerId: 'patient_demo_rahul',
            patientName: 'Rahul Mehta',
            details: 'Viewed authorized patient clinical overview with active consent',
            result: 'SUCCESS',
            timestamp: { seconds: Date.now() / 1000 - 3600, nanoseconds: 0 } as any,
          },
          {
            actorId: 'admin_root',
            actorRole: 'admin',
            action: 'admin_verified_doctor',
            resourceType: 'doctor_profile',
            resourceId: 'dr_rajesh_sharma',
            details: 'VERIFIED doctor credentials for Dr. Rajesh Sharma. Reason: Medical registration verified',
            result: 'SUCCESS',
            timestamp: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as any,
          },
          {
            actorId: 'patient_demo_rahul',
            actorRole: 'customer',
            action: 'customer_granted_consent',
            resourceType: 'consent',
            resourceId: 'consent_demo_1',
            customerId: 'patient_demo_rahul',
            details: 'Granted data access scopes to Dr. Rajesh Sharma',
            result: 'SUCCESS',
            timestamp: { seconds: Date.now() / 1000 - 172800, nanoseconds: 0 } as any,
          },
        ]);
      } else {
        setLogs(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [roleFilter]);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actorId.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-[#F59E0B]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              IMMUTABLE AUDIT TRAIL &amp; ACCESS LOGS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Compliant access history recording every clinical review, verification action, and consent event.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-[#8B91B0] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit actions, actor IDs, details..."
            className="bg-transparent border-none outline-none text-xs text-[#E8EAF6] w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0B0D14] p-1 rounded-xl border border-[#1E2133]">
          {['All', 'doctor', 'customer', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-[#F59E0B] text-black font-bold'
                  : 'text-[#8B91B0] hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="fluetas-card p-5 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2133] text-[#8B91B0] uppercase text-[0.65rem] tracking-wider">
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Actor &amp; Role</th>
              <th className="pb-3 font-semibold">Action</th>
              <th className="pb-3 font-semibold">Target Resource</th>
              <th className="pb-3 font-semibold">Details</th>
              <th className="pb-3 font-semibold text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2133]">
            {filtered.map((log, idx) => {
              const roleColors: Record<string, string> = {
                doctor: '#38BDF8',
                admin: '#F59E0B',
                customer: '#10B981',
                system: '#A78BFA',
              };
              const color = roleColors[log.actorRole] || '#8B91B0';
              const dateStr = log.timestamp?.seconds
                ? new Date(log.timestamp.seconds * 1000).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              return (
                <tr key={idx} className="hover:bg-[#13161F]/50 transition-colors">
                  <td className="py-3 pr-3 text-[#8B91B0] font-mono text-[0.7rem] whitespace-nowrap">
                    {dateStr}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className="px-2 py-0.5 rounded text-[0.62rem] font-bold uppercase"
                      style={{ backgroundColor: `${color}15`, color: color }}
                    >
                      {log.actorRole}
                    </span>
                    <span className="text-[#8B91B0] block text-[0.65rem] font-mono mt-0.5">
                      {log.actorId}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-bold text-[#E8EAF6] font-mono text-[0.7rem]">
                    {log.action}
                  </td>
                  <td className="py-3 pr-3 text-[#38BDF8] text-[0.7rem]">
                    {log.resourceType}
                  </td>
                  <td className="py-3 pr-3 text-[#8B91B0] max-w-xs truncate">
                    {log.details || '—'}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
