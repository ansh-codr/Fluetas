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
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Code,
  Loader2,
} from 'lucide-react';

type SortField = 'timestamp' | 'actorRole' | 'action' | 'result';
type SortOrder = 'asc' | 'desc';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const loadLogs = async () => {
    try {
      const res = await getAuditLogs({ actorRole: roleFilter });
      setLogs(res || []);
    } catch (err) {
      console.warn('[AdminAuditLogs] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [roleFilter]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredLogs = logs
    .filter(log => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (log.actorId && log.actorId.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.resourceType && log.resourceType.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        const aTime = a.timestamp?.seconds || 0;
        const bTime = b.timestamp?.seconds || 0;
        comparison = aTime - bTime;
      } else if (sortField === 'actorRole') {
        comparison = (a.actorRole || '').localeCompare(b.actorRole || '');
      } else if (sortField === 'action') {
        comparison = (a.action || '').localeCompare(b.action || '');
      } else if (sortField === 'result') {
        comparison = (a.result || '').localeCompare(b.result || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const roles = ['All', 'admin', 'doctor', 'expert', 'customer', 'system'];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#7A4E9E]/10 text-[#7A4E9E] flex items-center justify-center font-bold">
              <Shield size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              IMMUTABLE AUDIT &amp; ACCESS TRAIL
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Cryptographically timestamped compliance logging for practitioner actions, patient access, and RBAC events.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <div className="flex items-center gap-2.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl px-3.5 py-2 flex-1 max-w-md">
          <Search size={15} className="text-[#8A9482] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor ID, action type, resource..."
            className="bg-transparent border-none outline-none text-xs text-[#12160F] placeholder-[#8A9482] w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-[#12160F] text-white shadow-xs'
                  : 'bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-[#586151] hover:text-[#12160F]'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="fluetas-card p-5 overflow-x-auto bg-white border border-[rgba(18,22,15,0.08)]">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#586151]">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#7A4E9E]" />
            Loading audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#586151]">
            No audit records found matching your filters.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold">
                <th className="pb-3 cursor-pointer" onClick={() => toggleSort('timestamp')}>
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="pb-3 cursor-pointer" onClick={() => toggleSort('actorRole')}>
                  <div className="flex items-center gap-1">
                    <span>Actor &amp; Role</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="pb-3 cursor-pointer" onClick={() => toggleSort('action')}>
                  <div className="flex items-center gap-1">
                    <span>Action Event</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
              {filteredLogs.map((log, idx) => {
                const isExpanded = expandedIndex === idx;
                const timeStr = log.timestamp?.seconds
                  ? new Date(log.timestamp.seconds * 1000).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now';

                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="hover:bg-[#FAFAF6] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 pr-3 text-[#586151] font-mono text-[0.72rem] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#8A9482]" />
                          {timeStr}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 font-bold text-[#12160F]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${
                            log.actorRole === 'admin'
                              ? 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20'
                              : (log.actorRole as string) === 'doctor' || (log.actorRole as string) === 'expert'
                              ? 'bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20'
                              : 'bg-[#FAFAF6] text-[#586151] border border-[rgba(18,22,15,0.08)]'
                          }`}>
                            {log.actorRole || 'user'}
                          </span>
                          <span className="text-xs truncate max-w-[120px] font-mono text-[#586151]">
                            {log.actorId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 font-bold text-[#12160F] font-mono text-xs">
                        {log.action}
                      </td>
                      <td className="py-3.5 pr-3 text-[#586151] text-xs">
                        {log.resourceType || 'system'}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                          log.result === 'SUCCESS' || !log.result
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {log.result || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-4 bg-[#FAFAF6] border-y border-[rgba(18,22,15,0.06)]">
                          <div className="space-y-2 text-xs">
                            <p className="text-[#12160F] font-bold m-0">Event Details:</p>
                            <p className="text-[#586151] m-0 leading-relaxed">{log.details || 'No additional narrative recorded.'}</p>
                            <div className="mt-2 p-3 bg-white rounded-xl border border-[rgba(18,22,15,0.08)] font-mono text-[0.7rem] text-[#12160F] overflow-x-auto">
                              <pre className="m-0">{JSON.stringify(log, null, 2)}</pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
