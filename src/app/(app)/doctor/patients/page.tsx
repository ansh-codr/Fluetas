'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getAuthorizedPatientsForDoctor,
  DoctorPatientRelationship,
} from '@/lib/services/doctorService';
import {
  Users,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
} from 'lucide-react';

type SortField = 'customerName' | 'lastConsultationDate' | 'status';
type SortOrder = 'asc' | 'desc';

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<DoctorPatientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('customerName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const doctorId = user?.uid;

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }
    getAuthorizedPatientsForDoctor(doctorId)
      .then(res => {
        setPatients(res || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [doctorId]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = patients.filter(p =>
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (p.customerEmail && p.customerEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'lastConsultationDate') {
      comparison = (a.lastConsultationDate || '').localeCompare(b.lastConsultationDate || '');
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-[#38BDF8]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              AUTHORIZED PATIENT DIRECTORY
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Patients with verified consultations and active consent permissions. Click to preview records.
          </p>
        </div>

        {/* Consent Scope Notice */}
        <div className="flex items-center gap-2 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3.5 py-2 text-xs text-[#10B981]">
          <ShieldCheck size={16} />
          <span>Patient-Gated Consent Active</span>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="fluetas-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search size={16} className="text-[#8B91B0] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search authorized patients by name or email..."
            className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#E8EAF6] w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-[#8B91B0] hover:text-white cursor-pointer">
              Clear
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-[#0B0D14] p-1 rounded-xl border border-[#1E2133] text-xs text-[#8B91B0]">
          <span className="px-2 text-[0.68rem] font-semibold">Sort:</span>
          <button
            onClick={() => handleSort('customerName')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${sortField === 'customerName' ? 'bg-[#1E2133] text-white' : 'hover:text-white'}`}
          >
            Name {sortField === 'customerName' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <button
            onClick={() => handleSort('lastConsultationDate')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${sortField === 'lastConsultationDate' ? 'bg-[#1E2133] text-white' : 'hover:text-white'}`}
          >
            Recent {sortField === 'lastConsultationDate' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
        </div>
      </div>

      {/* Patient Cards List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1E2133]/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="fluetas-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center mb-2">
            <Users size={22} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
            No matching authorized patients
          </h3>
          <p className="text-xs text-[#8B91B0] m-0 mt-1 max-w-sm">
            Doctors can only access patients with valid consultation bookings and active consent scopes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(patient => {
            const isExpanded = expandedId === patient.relationshipId;

            return (
              <div
                key={patient.relationshipId}
                className={`fluetas-card p-5 flex flex-col justify-between gap-4 transition-all ${
                  isExpanded ? 'border-[#38BDF8]/50 bg-[#13161F]' : 'hover:border-[#38BDF8]/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : patient.relationshipId)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-bold flex items-center justify-center text-base shadow-lg shrink-0">
                        {patient.customerName[0]}
                      </div>
                      <div>
                        <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                          {patient.customerName}
                        </h3>
                        <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                          {patient.customerEmail || 'Verified Fluetas Member'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold ${
                        patient.status === 'active'
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {patient.status === 'active' ? 'Consent Active' : 'Consent Revoked'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#0B0D14] p-3 rounded-xl border border-[#1E2133]">
                    <div>
                      <span className="text-[0.65rem] text-[#8B91B0] block">Last Consultation</span>
                      <span className="text-[#E8EAF6] font-semibold">{patient.lastConsultationDate || '24 Aug 2026'}</span>
                    </div>
                    <div>
                      <span className="text-[0.65rem] text-[#8B91B0] block">Next Follow-Up</span>
                      <span className="text-[#38BDF8] font-semibold">{patient.nextFollowUpDate || '04 Sep 2026'}</span>
                    </div>
                  </div>

                  {/* Expandable Clinical Summary Preview */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] text-xs space-y-2 animate-slide-up">
                      <span className="text-[#38BDF8] font-bold text-[0.7rem] block">Active Consent Permissions:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['Health Profile', 'Workouts', 'Lab Reports', 'Prescriptions'].map(scope => (
                          <span key={scope} className="px-2 py-0.5 rounded bg-[#1E2133] text-[0.62rem] text-[#E8EAF6] font-semibold">
                            ✓ {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1E2133] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : patient.relationshipId)}
                    className="text-[0.68rem] text-[#8B91B0] hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {isExpanded ? 'Hide Details' : 'Quick Preview'}
                  </button>

                  <Link
                    href={`/doctor/patients/${patient.customerId}`}
                    className="btn-primary bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 px-4 py-1.5 text-xs font-bold no-underline flex items-center gap-1 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                  >
                    Open Patient Chart <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
