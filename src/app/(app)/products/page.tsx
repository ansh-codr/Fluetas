'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Bell,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ProductsOrdersPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/25 flex items-center gap-1">
            <Sparkles size={11} />
            Hardware &amp; Formulations Roadmap
          </span>
        </div>
        <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#12160F] m-0">
          FLUETAS HARDWARE &amp; NUTRACEUTICAL STORE
        </h1>
        <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1 max-w-xl">
          Clinical-grade wearable sensors, electrolyte formulations, and diagnostic hardware.
        </p>
      </div>

      {/* Main Feature Preview Card */}
      <div className="fluetas-card p-6 sm:p-8 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#D9622B]/10 text-[#D9622B] flex items-center justify-center text-3xl shadow-xs">
          <ShoppingBag size={32} />
        </div>

        <div className="max-w-lg space-y-2">
          <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            Physical Products &amp; Wearables Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-[#586151] m-0 leading-relaxed">
            Our certified physical formulations and biosensors are undergoing clinical pilot testing. Sign up to receive priority access to the first production batch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left">
          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#D9622B] font-bold text-xs">
              <Layers size={14} />
              <span>HydraPure Telemetry</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Micro-dosed electrolyte replenisher formulated specifically for high-volume resistance training recovery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2E7D32] font-bold text-xs">
              <Package size={14} />
              <span>BioSensor Patch (v1)</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Non-invasive dermal patch streaming real-time hydration and lactate thresholds directly to FLUETAS app.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2E6DA4] font-bold text-xs">
              <Sparkles size={14} />
              <span>Magnesium Glycinate PM</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Pharmaceutical-grade recovery complex designed for deep sleep architecture and central nervous system calming.
            </p>
          </div>
        </div>

        {/* Priority Waitlist Form */}
        <div className="w-full max-w-md pt-2">
          {subscribed ? (
            <div className="p-4 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-[#2E7D32] text-xs font-bold flex items-center justify-center gap-2 animate-slide-up">
              <CheckCircle2 size={16} />
              <span>You have been added to the priority hardware waitlist!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email for hardware waitlist..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs outline-none focus:border-[#D9622B]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#D9622B] hover:bg-[#B84E1E] text-white text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-xs"
              >
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
