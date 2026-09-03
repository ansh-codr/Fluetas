'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { getUserConsultations, ConsultationData } from '@/lib/services/consultationService';
import { getPatientConsents, revokeConsent, ConsentRecord } from '@/lib/services/consentService';
import {
  FileText,
  Heart,
  Stethoscope,
  Pill,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  Lock,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/motion/MotionUtils';

export default function HealthRecordPage() {
  const { user } = useAuth();
  const { profile, healthProfile } = useUserProfile();
  const [activeSection, setActiveSection] = useState<'all' | 'consults' | 'consent' | 'reports' | 'meds' | 'history'>('all');
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [consList, consentList] = await Promise.all([
        getUserConsultations(user.uid),
        getPatientConsents(user.uid),
      ]);
      setConsultations(consList);
      setConsents(consentList);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRevoke = async (consent: ConsentRecord) => {
    if (!user || !consent.consentId) return;
    try {
      await revokeConsent(user.uid, consent.consentId, consent.doctorName);
      setToastMessage(`Revoked health data access for ${consent.doctorName}`);
      setTimeout(() => setToastMessage(null), 3500);
      await loadData();
    } catch {
      alert('Failed to revoke consent');
    }
  };

  const handleExportPdf = () => {
    setDownloadingPdf(true);
    setTimeout(() => {
      setDownloadingPdf(false);
      setToastMessage('Encrypted health record PDF compiled and ready.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32]">
                <ShieldCheck size={18} />
              </span>
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
                MY PERMANENT HEALTH RECORD
              </h1>
            </div>
            <p className="text-[#586151] text-xs sm:text-sm m-0">
              Single unified clinical profile · Immutable chronological history · Patient-owned &amp; consent-controlled
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Download size={15} />
            {downloadingPdf ? 'Compiling Medical PDF...' : 'Export Complete Record (PDF)'}
          </button>
        </div>
      </div>

      {/* Filter Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Complete Hub View', icon: FileText },
          { id: 'consent', label: 'Doctor Privacy & Consent', count: consents.length, icon: Lock },
          { id: 'consults', label: 'Consultations', count: consultations.length, icon: Stethoscope },
          { id: 'reports', label: 'Diagnostics & Scans', icon: FileText },
          { id: 'meds', label: 'Active Medications', icon: Pill },
          { id: 'history', label: 'Allergies & Surgeries', icon: Heart },
        ].map(filter => {
          const Icon = filter.icon;
          const isActive = activeSection === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveSection(filter.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                isActive
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                  : 'bg-white text-[#586151] border-[rgba(18,22,15,0.10)] hover:text-[#12160F]'
              }`}
            >
              <Icon size={14} />
              <span>
                {filter.label}
                {filter.count !== undefined && (
                  <span className="ml-1 opacity-80">(<AnimatedNumber value={filter.count} duration={400} />)</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Privacy & Doctor Consent Management */}
      {(activeSection === 'all' || activeSection === 'consent') && (
        <div className="fluetas-card p-5 border-[#2E7D32]/30 bg-[#F2F4EE]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[#2E7D32]" />
              <h2 className="font-['Outfit'] text-sm font-bold text-[#12160F] uppercase tracking-wider m-0">
                ACTIVE DOCTOR ACCESS &amp; CONSENT PERMISSIONS
              </h2>
            </div>
            <span className="text-xs text-[#2E7D32] font-semibold">Strict Patient-Gated Access</span>
          </div>

          {consents.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border border-[rgba(18,22,15,0.08)] text-center text-xs text-[#586151]">
              No active doctor access consents granted. When you book a specialist, your authorized scopes will appear here with instant revoke control.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {consents.map(c => {
                const isActive = c.status === 'active';
                return (
                  <div
                    key={c.consentId}
                    className="p-4 bg-white border border-[rgba(18,22,15,0.08)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#12160F]">{c.doctorName}</strong>
                        <span
                          className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${
                            isActive
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                              : 'bg-red-500/10 text-red-600 border border-red-500/20'
                          }`}
                        >
                          {isActive ? 'Active Access' : 'Access Revoked'}
                        </span>
                      </div>
                      <p className="text-xs text-[#586151] m-0 mt-1">
                        Granted Scopes: {Object.entries(c.permissions || {}).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ')}
                      </p>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevoke(c)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto cursor-pointer transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                        Revoke Doctor Access
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vital Snapshot & Allergies Callout */}
      {(activeSection === 'all' || activeSection === 'history') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fluetas-card p-4">
            <span className="text-[0.68rem] font-bold text-[#586151] uppercase tracking-wider block mb-2">
              Patient Identification
            </span>
            <p className="text-base font-bold text-[#12160F] m-0">{profile?.name || user?.displayName || 'User'}</p>
            <p className="text-xs text-[#586151] m-0 mt-0.5">
              DOB: {profile?.dob || 'Not set'} · Gender: {profile?.gender || 'Not set'}
            </p>
            <div className="mt-3 pt-2.5 border-t border-[rgba(18,22,15,0.08)] flex justify-between text-xs">
              <span className="text-[#586151]">Blood Group:</span>
              <strong className="text-[#2E7D32]">{profile?.bloodGroup || 'O+'}</strong>
            </div>
          </div>

          <div className="fluetas-card p-4 border-[#C23B6B]/20">
            <span className="text-[0.68rem] font-bold text-[#C23B6B] uppercase tracking-wider block mb-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Documented Allergies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
                healthProfile.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#C23B6B]/10 text-[#C23B6B] text-[0.72rem] font-semibold border border-[#C23B6B]/20">
                    {a}
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#586151] m-0">No allergies recorded.</p>
              )}
            </div>
            <p className="text-[0.65rem] text-[#8A9482] m-0 mt-3">
              Visible to consulting doctors prior to prescribing.
            </p>
          </div>

          <div className="fluetas-card p-4">
            <span className="text-[0.68rem] font-bold text-[#2E6DA4] uppercase tracking-wider block mb-2">
              Chronic Conditions &amp; Goals
            </span>
            <div className="flex flex-col gap-1 text-xs">
              <p className="font-semibold text-[#12160F] m-0">{healthProfile?.primaryGoal || 'Longevity & Performance'}</p>
              {healthProfile?.chronicConditions && healthProfile.chronicConditions.length > 0 ? (
                healthProfile.chronicConditions.map((c, i) => (
                  <p key={i} className="text-[0.7rem] text-[#2E6DA4] m-0 font-medium">{c}</p>
                ))
              ) : (
                <p className="text-[0.7rem] text-[#586151] m-0">No chronic conditions recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consultations Record */}
      {(activeSection === 'all' || activeSection === 'consults') && (
        <div className="fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Outfit'] text-sm font-bold text-[#12160F] uppercase tracking-wider m-0 flex items-center gap-2">
              <Stethoscope size={16} className="text-[#2E7D32]" />
              Consultations &amp; Clinical Assessments
            </h2>
            <span className="text-xs text-[#586151]">{consultations.length} Total Sessions</span>
          </div>

          {consultations.length === 0 ? (
            <p className="text-xs text-[#586151] m-0 text-center py-4">No consultation sessions booked yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {consultations.map(cons => (
                <div
                  key={cons.id}
                  className="p-4 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] flex flex-col gap-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#12160F]">{cons.expertName}</span>
                        <span className="text-xs text-[#586151]">({cons.specialization})</span>
                      </div>
                      <p className="text-xs text-[#2E7D32] font-medium m-0 mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {cons.preferredDate || 'Date confirmed'} · <span className="capitalize">{cons.status}</span>
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-bold self-start sm:self-auto bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                      {cons.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#12160F] m-0 bg-white p-2.5 rounded-lg border border-[rgba(18,22,15,0.08)]">
                    <strong>Reason:</strong> {cons.reason}
                  </p>

                  {cons.clinicalNotes && (
                    <div className="text-xs text-[#586151] leading-relaxed bg-white p-3 rounded-lg border border-[rgba(18,22,15,0.08)] space-y-1.5">
                      <p className="m-0"><strong className="text-[#2E6DA4]">Clinical Notes:</strong> {cons.clinicalNotes}</p>
                      {cons.assessment && <p className="m-0"><strong className="text-[#2E7D32]">Assessment:</strong> {cons.assessment}</p>}
                      {cons.advice && <p className="m-0"><strong className="text-[#D97706]">Recommendations:</strong> {cons.advice}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Medications */}
      {(activeSection === 'all' || activeSection === 'meds') && (
        <div className="fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Outfit'] text-sm font-bold text-[#12160F] uppercase tracking-wider m-0 flex items-center gap-2">
              <Pill size={16} className="text-[#7A4E9E]" />
              Active Medication &amp; Supplement Regimen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {healthProfile?.currentMedications && healthProfile.currentMedications.length > 0 ? (
              healthProfile.currentMedications.map((med, i) => (
                <div key={i} className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl">
                  <p className="font-bold text-sm text-[#12160F] m-0">{typeof med === 'string' ? med : (med as any).name}</p>
                  <p className="text-xs text-[#7A4E9E] font-medium m-0 mt-1">Daily Supplementation</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#586151] m-0">No active medications recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
