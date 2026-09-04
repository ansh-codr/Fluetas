'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientConsents,
  revokeConsent,
  ConsentRecord,
} from '@/lib/services/consentService';
import {
  ShieldCheck,
  Bell,
  Cpu,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Sparkles,
  MessageSquareHeart,
  PlusCircle,
  ThumbsUp,
} from 'lucide-react';
import { openFeedbackDialog } from '@/components/ui/FeedbackWidget';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'devices' | 'account' | 'feedback'>('privacy');
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [revokeToast, setRevokeToast] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState([
    { label: 'Workout & Training Volume Pacing', desc: 'Daily alerts when ready for next scheduled session', checked: true },
    { label: 'Hydration Hourly Reminders', desc: 'Contextual reminders based on workout intensity and weather', checked: true },
    { label: 'Clinical Report Upload & Doctor Notes', desc: 'Instant notification when doctor publishes a consultation report', checked: true },
    { label: 'Upcoming Product Launch VIP Alerts', desc: 'Early access notifications for pre-launch formulas', checked: true },
  ]);

  useEffect(() => {
    if (!user) return;
    getPatientConsents(user.uid)
      .then(res => setConsents(res.filter(c => c.status === 'active')))
      .catch(() => setConsents([]));
  }, [user]);

  const handleRevokeConsent = async (consentId: string, doctorName: string) => {
    if (!user) return;
    try {
      await revokeConsent(user.uid, consentId, doctorName);
      setConsents(prev => prev.filter(c => c.consentId !== consentId && c.id !== consentId));
      setRevokeToast(`Consent access revoked for ${doctorName}. Logged to audit trail.`);
      setTimeout(() => setRevokeToast(null), 3500);
    } catch {
      alert('Failed to revoke consent.');
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Toast */}
      {revokeToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#EF4444] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <AlertTriangle size={16} />
          {revokeToast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
          ACCOUNT &amp; PRIVACY SETTINGS
        </h1>
        <p className="text-[#586151] text-xs sm:text-sm m-0">
          Manage clinical access permissions, device integrations, notifications, and feedback.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[rgba(18,22,15,0.10)] gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'privacy', label: 'Clinical Consent & Privacy', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'devices', label: 'Connect Devices', icon: Cpu },
          { id: 'account', label: 'Account Security', icon: Lock },
          { id: 'feedback', label: 'Feedback & Suggestions', icon: MessageSquareHeart },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#2E7D32] border-[#2E7D32]'
                  : 'text-[#586151] border-transparent hover:text-[#12160F]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: CLINICAL CONSENT & PRIVACY ─────────────────────────────── */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="fluetas-card p-5 bg-gradient-to-r from-white to-[#F2F4EE]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0">
                  Sovereign Health Data Governance
                </h3>
                <p className="text-xs text-[#586151] m-0 mt-1 leading-relaxed">
                  Your medical data is encrypted and strictly isolated. Doctors only have access to records you explicitly authorize during appointment scheduling. You can instantly revoke doctor access at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="fluetas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-title">ACTIVE PRACTITIONER CONSENTS ({consents.length})</span>
              <span className="text-[0.68rem] text-[#8A9482]">Zero-Knowledge Audit Trail</span>
            </div>

            {consents.length === 0 ? (
              <div className="py-8 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
                <CheckCircle2 size={28} className="text-[#2E7D32] mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-xs text-[#12160F] m-0">No Active Data Sharing Consents</p>
                <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
                  No practitioners or external clinics currently have access to your health records.
                </p>
              </div>
            ) : (
              consents.map(consent => {
                const grantedDate = consent.grantedAt
                  ? new Date(consent.grantedAt.seconds * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={consent.id || consent.consentId}
                    className="p-4 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2E7D32]/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#12160F]">{consent.doctorName}</span>
                        <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                          Active Consent
                        </span>
                      </div>
                      <p className="text-xs text-[#586151] m-0">
                        Granted on {grantedDate} · Scope: <span className="text-[#12160F]">Clinical Consultation</span>
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[0.65rem] text-[#8A9482]">Authorized Scopes:</span>
                        {Object.entries(consent.permissions || {})
                          .filter(([, val]) => val)
                          .map(([key]) => (
                            <span
                              key={key}
                              className="text-[0.62rem] px-2 py-0.5 rounded bg-white border border-[rgba(18,22,15,0.08)] text-[#586151]"
                            >
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevokeConsent(consent.id || consent.consentId, consent.doctorName)}
                      className="px-3 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 text-xs font-bold self-start sm:self-auto cursor-pointer transition-colors"
                    >
                      Revoke Access
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: NOTIFICATIONS ─────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="fluetas-card p-5 space-y-4 text-xs">
          <span className="section-title">NOTIFICATION &amp; TELEMETRY ALERTS</span>

          {notifSettings.map((item, idx) => (
            <label
              key={idx}
              className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-[#12160F] m-0">{item.label}</p>
                <p className="text-[#586151] text-xs m-0 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => setNotifSettings(prev => prev.map((n, i) => i === idx ? { ...n, checked: !n.checked } : n))}
                className="accent-[#2E7D32] w-4 h-4 cursor-pointer"
              />
            </label>
          ))}
        </div>
      )}

      {/* ─── TAB 3: CONNECT YOUR DEVICES (Section 5 Requirement) ─────────── */}
      {activeTab === 'devices' && (
        <div className="fluetas-card p-6 sm:p-8 bg-white border border-[rgba(18,22,15,0.08)] text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center">
            <Sparkles size={28} />
          </div>

          <div className="max-w-md space-y-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#2E6DA4] bg-[#2E6DA4]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Coming Soon
            </span>
            <h3 className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">
              CONNECT YOUR DEVICES
            </h3>
            <p className="text-xs text-[#586151] m-0 leading-relaxed">
              Connect supported health and fitness devices to automatically sync selected activity and wellness data.
            </p>
          </div>

          <div className="p-4 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.08)] text-left w-full max-w-md text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#12160F]">
              <CheckCircle2 size={15} className="text-[#2E7D32]" />
              <span>Manual tracking is available</span>
            </div>
            <p className="text-[#586151] text-[0.72rem] m-0 pl-6">
              You can currently log hydration, sleep, workouts, meals, and symptoms manually with real-time biometric progress calculations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg pt-1">
            {[
              { name: 'Apple HealthKit', icon: '🍎', desc: 'Planned' },
              { name: 'Health Connect', icon: '🤖', desc: 'Planned' },
              { name: 'Garmin Connect', icon: '⌚', desc: 'Planned' },
              { name: 'Oura / Whoop', icon: '💍', desc: 'Planned' },
            ].map(dev => (
              <div key={dev.name} className="p-3 bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] rounded-xl text-center">
                <span className="text-2xl block mb-1">{dev.icon}</span>
                <span className="font-bold text-xs text-[#12160F] block">{dev.name}</span>
                <span className="text-[0.62rem] text-[#8A9482] block">{dev.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ACCOUNT SECURITY ─────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="fluetas-card p-5 space-y-4 text-xs">
          <span className="section-title">ACCOUNT SECURITY &amp; CREDENTIALS</span>

          <div className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#12160F] m-0">Two-Factor Authentication (2FA)</p>
              <p className="text-[#586151] text-xs m-0 mt-0.5">Protect your medical data with biometrics or SMS 2FA</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold">
              Active
            </span>
          </div>

          <div className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#12160F] m-0">End-to-End Clinical Encryption</p>
              <p className="text-[#586151] text-xs m-0 mt-0.5">All consult notes are encrypted via AES-GCM at rest</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold">
              Enforced
            </span>
          </div>
        </div>
      )}

      {/* ─── TAB 5: FEEDBACK & SUGGESTIONS ──────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="fluetas-card p-6 bg-gradient-to-r from-white to-[#F2F4EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                <MessageSquareHeart size={22} />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                  Help Shape the Fluetas Platform
                </h3>
                <p className="text-xs text-[#586151] m-0 mt-1 leading-relaxed max-w-xl">
                  Whether you have an idea for a new training metric, a suggested nutrition formula, or experienced an issue during clinical consultations, your feedback directly guides our engineering team.
                </p>
              </div>
            </div>

            <button
              onClick={() => openFeedbackDialog()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256328] transition-all cursor-pointer shadow-sm shrink-0 hover:scale-105"
            >
              <PlusCircle size={14} />
              <span>Submit Feedback</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="fluetas-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#12160F] font-['Outfit']">
                <span>💡</span>
                <span>FEATURE SUGGESTIONS &amp; IDEAS</span>
              </div>
              <p className="text-xs text-[#586151] m-0 leading-relaxed">
                Propose wearable integrations, custom meal planning algorithms, or exercise variation requests.
              </p>
              <button
                onClick={() => openFeedbackDialog({ category: 'feature' })}
                className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer flex items-center gap-1 pt-1"
              >
                <span>Suggest a Feature →</span>
              </button>
            </div>

            <div className="fluetas-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#12160F] font-['Outfit']">
                <span>⭐</span>
                <span>PUBLIC REVIEWS &amp; ROADMAP</span>
              </div>
              <p className="text-xs text-[#586151] m-0 leading-relaxed">
                Explore community reviews, live ratings, and see which community-suggested features have shipped.
              </p>
              <Link
                href="/feedback"
                className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1 pt-1 no-underline"
              >
                <span>View Public Feedback Hub →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
