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
      setMessage(`Successfully seeded ${res.count} verified doctors to Firestore.`);
    } catch (err) {
      setMessage(`Error seeding doctors: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      setMessage(`Successfully seeded sample daily logs (hydration, meal, sleep) for current user.`);
    } catch (err) {
      setMessage(`Error seeding logs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeedingUser(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-[#F59E0B]" />
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            PLATFORM SETTINGS &amp; DEV SEEDING
          </h1>
        </div>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          Environment configuration, schema maintenance, and demo data generator.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-[#10B981] text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* Dev Seeding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="fluetas-card p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-[#38BDF8]" />
              <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                Seed Verified Doctors
              </h3>
            </div>
            <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
              Populates the top-level Firestore <code className="text-[#38BDF8]">/doctors</code> collection with 4 vetted specialists across Physiotherapy, Sports Medicine, Nutrition, and Gynecology.
            </p>
          </div>

          <button
            onClick={handleSeedDoctors}
            disabled={seedingDocs}
            className="btn-primary bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 py-2.5 px-4 text-xs font-bold justify-center flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {seedingDocs ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {seedingDocs ? 'Seeding...' : 'Seed Doctors Collection'}
          </button>
        </div>

        <div className="fluetas-card p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-[#10B981]" />
              <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                Seed Sample User Day Logs
              </h3>
            </div>
            <p className="text-xs text-[#8B91B0] m-0 leading-relaxed">
              Creates sample hydration entries, balanced meal logs, and sleep cycles for the active account to test wellness scoring.
            </p>
          </div>

          <button
            onClick={handleSeedUser}
            disabled={seedingUser || !user}
            className="btn-primary py-2.5 px-4 text-xs font-bold justify-center flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {seedingUser ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {seedingUser ? 'Seeding...' : 'Seed My Account Day Logs'}
          </button>
        </div>
      </div>
    </div>
  );
}
