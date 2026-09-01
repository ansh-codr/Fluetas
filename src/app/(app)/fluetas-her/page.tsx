'use client';

import React from 'react';
import Link from 'next/link';
import CircleProgress from '@/components/ui/CircleProgress';
import { mockCycleData, mockProducts } from '@/lib/mock/dashboardData';
import {
  HeartHandshake,
  Calendar,
  Activity,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function FluetasHerPage() {
  const { currentDay, phase, daysToOvulation, logs } = mockCycleData;
  const herProduct = mockProducts.find(p => p.id === 'her') || mockProducts[4];

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#2A1120] to-[#1F0E17] border-[#F472B6]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40 flex items-center gap-1">
                <Sparkles size={11} />
                FLUETAS HER · Hormonal & Circadian Balance
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              WOMEN&apos;S HEALTH & CYCLE SYNCHRONIZATION
            </h1>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
              Phase-matched nutrition, energy pacing, and symptom biomarkers for holistic vitality.
            </p>
          </div>

          <Link
            href="/cycle-tracker"
            className="btn-primary bg-gradient-to-r from-[#F472B6] to-[#DB2777] text-white text-xs px-4 py-2.5 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center no-underline shadow-[0_0_16px_rgba(244,114,182,0.3)]"
          >
            <Calendar size={14} />
            Open Full Cycle Calendar
          </Link>
        </div>
      </div>

      {/* Cycle Phase Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phase Card */}
        <div className="fluetas-card p-5 flex flex-col justify-between gap-3 bg-[#0B0D14] border-[#F472B6]/30">
          <div>
            <span className="text-[0.68rem] font-bold text-[#F472B6] uppercase tracking-wider block mb-1">
              Current Cycle Phase
            </span>
            <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6] m-0">
              Day {currentDay} · {phase}
            </h2>
            <p className="text-xs text-[#38BDF8] font-semibold mt-1">
              {daysToOvulation} days to Estimated Ovulation
            </p>
          </div>

          <div className="p-3 bg-[#13161F] rounded-lg border border-[#1E2133] text-xs text-[#8B91B0]">
            <strong className="text-[#E8EAF6] block mb-0.5">Estrogen & Energy Rising</strong>
            Optimal phase for high-intensity lifting, endurance pacing, and complex carbohydrate absorption.
          </div>
        </div>

        {/* Phase Recommendations */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-3">
          <span className="section-title">TODAY&apos;S PHASE NUTRITION & TRAINING SYNC</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] font-bold text-[#10B981] uppercase block mb-1">Exercise Focus</span>
              <p className="font-bold text-[#E8EAF6] m-0 text-sm">Strength & Heavy Lifts</p>
              <p className="text-[#8B91B0] m-0 mt-1">Higher pain tolerance & insulin sensitivity during follicular surge.</p>
            </div>

            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] font-bold text-[#F59E0B] uppercase block mb-1">Dietary Focus</span>
              <p className="font-bold text-[#E8EAF6] m-0 text-sm">Cruciferous Veggies & Clean Protein</p>
              <p className="text-[#8B91B0] m-0 mt-1">Supports liver estrogen clearance; pair with healthy omega-3 fats.</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1E2133]">
            <span className="text-[#8B91B0]">Need expert medical advice for cycle health?</span>
            <Link href="/experts" className="text-[#F472B6] font-semibold flex items-center gap-1 hover:underline no-underline">
              Consult Gynecologist <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* HER+ Product Tie-In Banner */}
      <div className="fluetas-card p-5 bg-gradient-to-r from-[#2A0E1C] via-[#1C0A15] to-[#13161F] border-[#F472B6]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F472B6]/30 to-[#DB2777]/10 border border-[#F472B6]/40 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_16px_rgba(244,114,182,0.25)]">
            ♀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-[#F9A8D4] m-0">
                FLUETAS HER+ SUPERFRUIT ELIXIR
              </h3>
              <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#F472B6]/20 text-[#F472B6]">
                Formulation
              </span>
            </div>
            <p className="text-xs text-[#8B91B0] m-0 mt-1 max-w-xl">
              Myo-Inositol, Shatavari, Organic Tart Cherry & Chasteberry extract to support ovulatory regularity and menstrual ease.
            </p>
          </div>
        </div>

        <Link
          href="/products?product=her"
          className="px-4 py-2 rounded-lg bg-[#F472B6] text-black font-bold text-xs hover:opacity-90 no-underline shrink-0 shadow-[0_0_12px_rgba(244,114,182,0.3)] self-stretch sm:self-auto text-center"
        >
          Explore HER+ Formula
        </Link>
      </div>

      {/* Quick Navigation into Specialized Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/cycle-tracker"
          className="fluetas-card p-4 flex items-center justify-between hover:border-[#F472B6]/50 transition-all no-underline group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F472B6]/15 text-[#F472B6] flex items-center justify-center text-lg">
              🩸
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm text-[#E8EAF6] m-0 group-hover:text-[#F472B6] transition-colors">
                Full Cycle Tracker & Calendar
              </h3>
              <p className="text-xs text-[#8B91B0] m-0 mt-0.5">Log flow, PMS symptoms & ovulation tests</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8B91B0] group-hover:text-[#F472B6] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/symptoms"
          className="fluetas-card p-4 flex items-center justify-between hover:border-[#38BDF8]/50 transition-all no-underline group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center text-lg">
              🩺
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm text-[#E8EAF6] m-0 group-hover:text-[#38BDF8] transition-colors">
                Symptom Frequency Log
              </h3>
              <p className="text-xs text-[#8B91B0] m-0 mt-0.5">Track cramps, mood fluctuations & bloating</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8B91B0] group-hover:text-[#38BDF8] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
