'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { seedDemoDoctors, seedDemoUserActivity } from '@/lib/dev/seedDemoData';
import { Shield, Database, Sparkles, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [seedingDocs, setSeedingDocs] = useState(false);
  const [seedingUser, setSeedingUser] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedDoctors = async () => {
    setSeedingDocs(true);
    setMessage('');
    try {
      const res = await seedDemoDoctors();
      setMessage(`Successfully seeded ${res.count} verified practitioners to Firestore.`);
    } catch (err) {
      setMessage(`Error seeding practitioners: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeedingDocs(false);
    }
  };

  const handleSeedUser = async () => {
    if (!user) return;
    setSeedingUser(true);
    setMessage('');
    try {
      await seedDemoUserActivity(user.uid);
      setMessage(`Successfully seeded sample daily telemetry records (hydration, workouts, sleep) for current user.`);
    } catch (err) {
      setMessage(`Error seeding logs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeedingUser(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#D9622B]/10 text-[#D9622B] flex items-center justify-center font-bold">
            <Shield size={18} />
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            PLATFORM SETTINGS &amp; DEV TOOLS
          </h1>
        </div>
        <p className="text-[#586151] text-xs sm:text-sm m-0">
          Environment configuration, schema maintenance, and dev data seeding utilities.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-[#2E7D32]/10 border border-[#2E7D32]/25 rounded-xl text-[#2E7D32] text-xs font-bold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* Dev Seeding Card */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.08)] shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[rgba(18,22,15,0.08)]">
          <Database size={18} className="text-[#D9622B]" />
          <h2 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            Firestore Development Seeding
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#12160F] m-0 mb-1">Seed Sample Practitioners</h3>
              <p className="text-xs text-[#586151] m-0 leading-relaxed">
                Generates sample clinical profiles (Ortho, Nutrition, Cardiology) under `/doctors` collection for development testing.
              </p>
            </div>
            <button
              onClick={handleSeedDoctors}
              disabled={seedingDocs}
              className="px-4 py-2.5 rounded-xl bg-[#12160F] hover:bg-[#25201A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {seedingDocs ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Seeding Practitioners...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#D9622B]" />
                  <span>Seed Verified Practitioners</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#12160F] m-0 mb-1">Seed User Activity Logs</h3>
              <p className="text-xs text-[#586151] m-0 leading-relaxed">
                Adds 7 days of realistic hydration and wellness telemetry under your sovereign UID for testing analytics charts.
              </p>
            </div>
            <button
              onClick={handleSeedUser}
              disabled={seedingUser || !user}
              className="px-4 py-2.5 rounded-xl bg-[#12160F] hover:bg-[#25201A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {seedingUser ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Seeding Telemetry...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="text-[#2E7D32]" />
                  <span>Seed My Account Telemetry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
