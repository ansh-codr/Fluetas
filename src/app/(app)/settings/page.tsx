'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPatientConsents, revokeConsent, ConsentRecord } from '@/lib/services/consentService';
import {
  Shield,
  Bell,
  Smartphone,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'devices' | 'account'>('privacy');
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [revokeToast, setRevokeToast] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState([
    { label: 'Workout & Training Volume Pacing', desc: 'Daily alerts when ready for next scheduled session', checked: true },
    { label: 'Hydration Hourly Reminders', desc: 'Contextual reminders based on workout intensity and weather', checked: true },
    { label: 'Clinical Report Upload & Doctor Notes', desc: 'Instant notification when doctor publishes a consultation report', checked: true },
    { label: 'Upcoming Product Launch VIP Alerts', desc: 'Early access notifications for pre-launch formulas', checked: true },
  ]);
  const [devices, setDevices] = useState([
    { name: 'Apple HealthKit', icon: '🍎', connected: true, syncTime: 'Synced 2m ago' },
    { name: 'Garmin Connect', icon: '⌚', connected: true, syncTime: 'Synced 15m ago' },
    { name: 'Whoop Strap 4.0', icon: '⚡', connected: false, syncTime: 'Pair via Bluetooth' },
    { name: 'Oura Ring Gen 3', icon: '💍', connected: false, syncTime: 'Connect Cloud API' },
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

  const toggleDevice = (name: string) => {
    setDevices(prev => prev.map(d => d.name === name ? { ...d, connected: !d.connected, syncTime: !d.connected ? 'Just connected' : 'Disconnected' } : d));
    const dev = devices.find(d => d.name === name);
    if (dev) {
      setRevokeToast(dev.connected ? `${name} disconnected.` : `${name} connected successfully!`);
      setTimeout(() => setRevokeToast(null), 3000);
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
          ACCOUNT & PRIVACY SETTINGS
        </h1>
        <p className="text-[#586151] text-xs sm:text-sm m-0">
          Manage clinical access permissions, connected wearables, and notification alerts.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[rgba(18,22,15,0.10)] gap-2 overflow-x-auto no-scrollbar">
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
                  ? 'text-[#2E7D32] border-[#2E7D32]'
                  : 'text-[#586151] border-transparent hover:text-[#12160F]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PRIVACY & DOCTOR CONSENTS ────────────────────────────── */}
      {activeTab === 'privacy' && (
        <div className="flex flex-col gap-4">
          <div className="fluetas-card p-5 bg-[#F2F4EE] border-[rgba(18,22,15,0.10)]">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={18} className="text-[#2E7D32]" />
              <h2 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                ACTIVE CLINICAL DATA AUTHORIZATIONS
              </h2>
            </div>
            <p className="text-xs text-[#586151] m-0 leading-relaxed">
              In accordance with FLUETAS data sovereignty principles, doctors only access the specific subcollections you explicitly authorize. You can revoke access at any second.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {consents.length === 0 ? (
              <div className="fluetas-card p-8 text-center text-[#586151]">
                <Shield size={32} className="mx-auto mb-2 text-[#8A9482]" />
                <p className="text-sm font-bold text-[#12160F] m-0">No Active Doctor Consents</p>
                <p className="text-xs m-0 mt-1">All your medical data is currently locked in private storage.</p>
              </div>
            ) : (
              consents.map(consent => {
                const expiresStr = consent.expiresAt?.seconds
                  ? new Date(consent.expiresAt.seconds * 1000).toLocaleDateString()
                  : 'Active Consent';

                return (
                  <div
                    key={consent.consentId || consent.id}
                    className="fluetas-card p-5 flex flex-col gap-3.5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                            {consent.doctorName}
                          </h3>
                        </div>
                        <p className="text-xs text-[#2E7D32] font-semibold m-0 mt-0.5">
                          Status: Active · {expiresStr}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRevokeConsent(consent.consentId || consent.id || '', consent.doctorName)}
                        className="px-3 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 text-[#EF4444] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} /> Revoke Access Now
                      </button>
                    </div>

                    {/* Granted Scope Badges */}
                    <div>
                      <span className="text-[0.65rem] font-bold text-[#586151] uppercase block mb-1.5">
                        Authorized Data Scopes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(consent.permissions || {}).map(([scope, granted]) => (
                          <span
                            key={scope}
                            className={`px-2 py-0.5 rounded text-[0.68rem] font-semibold flex items-center gap-1 ${
                              granted
                                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                                : 'bg-[#F2F4EE] text-[#8A9482] line-through opacity-60'
                            }`}
                          >
                            {granted ? '✓' : '✗'} {scope.replace(/([A-Z])/g, ' $1')}
                          </span>
                        ))}
                      </div>
                    </div>
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
          <span className="section-title">NOTIFICATION & TELEMETRY ALERTS</span>

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

      {/* ─── TAB 3: CONNECTED WEARABLES ──────────────────────────────────── */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map(device => (
            <div
              key={device.name}
              className="fluetas-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{device.icon}</span>
                <div>
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0">{device.name}</h3>
                  <p className="text-[0.68rem] text-[#586151] m-0">{device.syncTime}</p>
                </div>
              </div>
              <button
                onClick={() => toggleDevice(device.name)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                  device.connected
                    ? 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20'
                    : 'bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] hover:bg-[#2E7D32]/20'
                }`}
              >
                {device.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 4: ACCOUNT SECURITY ─────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="fluetas-card p-5 space-y-4 text-xs">
          <span className="section-title">ACCOUNT SECURITY & CREDENTIALS</span>

          <div className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#12160F] m-0">Two-Factor Authentication (2FA)</p>
              <p className="text-[#586151] text-xs m-0 mt-0.5">Protect your medical data with biometrics or SMS 2FA</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
              Enabled
            </span>
          </div>

          <div className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#12160F] m-0">End-to-End Encryption Key</p>
              <p className="text-[#586151] text-xs m-0 mt-0.5">AES-256 client encryption for medical uploads</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText('KEY-9824-OK'); setRevokeToast('Encryption key copied to clipboard.'); setTimeout(() => setRevokeToast(null), 3000); }}
              className="font-mono text-xs text-[#2E6DA4] bg-white px-2.5 py-1 rounded-lg border border-[rgba(18,22,15,0.10)] font-bold hover:bg-[#F2F4EE] cursor-pointer transition-colors"
              title="Click to copy"
            >
              KEY-9824-OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
