'use client';

import React, { useState } from 'react';
import { mockUser, mockConsentsList } from '@/lib/mock/dashboardData';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Smartphone,
  Lock,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'devices' | 'account'>('privacy');
  const [consents, setConsents] = useState(mockConsentsList);
  const [revokeToast, setRevokeToast] = useState<string | null>(null);

  const handleRevokeConsent = (consentId: string, doctorName: string) => {
    setConsents(consents.filter(c => c.id !== consentId));
    setRevokeToast(`Consent access revoked for ${doctorName}. Logged to audit trail.`);
    setTimeout(() => setRevokeToast(null), 3500);
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
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
          ACCOUNT & PRIVACY SETTINGS
        </h1>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          Manage clinical access permissions, connected wearables, and notification alerts.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#1E2133] gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'privacy', label: 'Privacy & Doctor Consents', icon: Shield },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
          { id: 'devices', label: 'Connected Wearables', icon: Smartphone },
          { id: 'account', label: 'Account Security', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[2px] shrink-0 cursor-pointer ${
                isActive
                  ? 'text-[#10B981] border-[#10B981]'
                  : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PRIVACY & DOCTOR CONSENTS (§4 Requirement) ───────────── */}
      {activeTab === 'privacy' && (
        <div className="flex flex-col gap-4">
          <div className="fluetas-card p-5 bg-gradient-to-r from-[#13161F] to-[#14231E] border-[#10B981]/30">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={18} className="text-[#10B981]" />
              <h2 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                ACTIVE CLINICAL DATA AUTHORIZATIONS
              </h2>
            </div>
            <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
              In accordance with FLUETAS data sovereignty principles, doctors only access the specific subcollections you explicitly authorize. You can revoke access at any second.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {consents.length === 0 ? (
              <div className="fluetas-card p-8 text-center text-[#8B91B0]">
                <Shield size={32} className="mx-auto mb-2 text-[#3A3F58]" />
                <p className="text-sm font-bold text-[#E8EAF6] m-0">No Active Doctor Consents</p>
                <p className="text-xs m-0 mt-1">All your medical data is currently locked in private storage.</p>
              </div>
            ) : (
              consents.map(consent => (
                <div
                  key={consent.id}
                  className="fluetas-card p-5 flex flex-col gap-3.5 border-[#1E2133] hover:border-[#2A3050] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                          {consent.doctorName}
                        </h3>
                        <span className="text-xs text-[#8B91B0]">({consent.specialization})</span>
                      </div>
                      <p className="text-xs text-[#10B981] font-semibold m-0 mt-0.5">
                        Status: {consent.status} · Expires {new Date(consent.expiresAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevokeConsent(consent.id, consent.doctorName)}
                      className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} /> Revoke Access Now
                    </button>
                  </div>

                  {/* Granted Scope Badges */}
                  <div>
                    <span className="text-[0.65rem] font-bold text-[#8B91B0] uppercase block mb-1.5">
                      Authorized Data Scopes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(consent.grantedScopes).map(([scope, granted]) => (
                        <span
                          key={scope}
                          className={`px-2 py-0.5 rounded text-[0.68rem] font-semibold flex items-center gap-1 ${
                            granted
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-[#1E2133] text-[#8B91B0] line-through opacity-50'
                          }`}
                        >
                          {granted ? '✓' : '✗'} {scope.replace(/([A-Z])/g, ' $1')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: NOTIFICATIONS ─────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="fluetas-card p-5 space-y-4 text-xs">
          <span className="section-title">NOTIFICATION & TELEMETRY ALERTS</span>

          {[
            { label: 'Workout & Training Volume Pacing', desc: 'Daily alerts when ready for next scheduled session', checked: true },
            { label: 'Hydration Hourly Reminders', desc: 'Contextual reminders based on workout intensity and weather', checked: true },
            { label: 'Clinical Report Upload & Doctor Notes', desc: 'Instant notification when doctor publishes a consultation report', checked: true },
            { label: 'Upcoming Product Launch VIP Alerts', desc: 'Early access notifications for pre-launch formulas', checked: true },
          ].map((item, idx) => (
            <label
              key={idx}
              className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-[#E8EAF6] m-0">{item.label}</p>
                <p className="text-[#8B91B0] text-xs m-0 mt-0.5">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={item.checked} className="accent-[#10B981] w-4 h-4" />
            </label>
          ))}
        </div>
      )}

      {/* ─── TAB 3: CONNECTED WEARABLES ──────────────────────────────────── */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Apple HealthKit', icon: '🍎', status: 'Connected', syncTime: 'Synced 2m ago', color: '#10B981' },
            { name: 'Garmin Connect', icon: '⌚', status: 'Connected', syncTime: 'Synced 15m ago', color: '#10B981' },
            { name: 'Whoop Strap 4.0', icon: '⚡', status: 'Not Connected', syncTime: 'Pair via Bluetooth', color: '#8B91B0' },
            { name: 'Oura Ring Gen 3', icon: '💍', status: 'Not Connected', syncTime: 'Connect Cloud API', color: '#8B91B0' },
          ].map(device => (
            <div
              key={device.name}
              className="fluetas-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{device.icon}</span>
                <div>
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">{device.name}</h3>
                  <p className="text-[0.68rem] text-[#8B91B0] m-0">{device.syncTime}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                device.status === 'Connected'
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#1E2133] text-[#8B91B0]'
              }`}>
                {device.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 4: ACCOUNT SECURITY ─────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="fluetas-card p-5 space-y-4 text-xs">
          <span className="section-title">ACCOUNT SECURITY & CREDENTIALS</span>

          <div className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#E8EAF6] m-0">Two-Factor Authentication (2FA)</p>
              <p className="text-[#8B91B0] text-xs m-0 mt-0.5">Protect your medical data with biometrics or SMS 2FA</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981]">
              Enabled
            </span>
          </div>

          <div className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#E8EAF6] m-0">End-to-End Encryption Key</p>
              <p className="text-[#8B91B0] text-xs m-0 mt-0.5">AES-256 client encryption for medical uploads</p>
            </div>
            <span className="font-mono text-xs text-[#38BDF8]">
              KEY-9824-OK
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
