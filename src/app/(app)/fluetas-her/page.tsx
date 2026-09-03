'use client';

import React from 'react';
import Link from 'next/link';
import { mockCycleData } from '@/lib/mock/dashboardData';
import {
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function FluetasHerPage() {
  const { currentDay, phase, daysToOvulation } = mockCycleData;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#C23B6B]/10 text-[#C23B6B] border border-[#C23B6B]/20 flex items-center gap-1">
                <Sparkles size={11} />
                FLUETAS HER · Hormonal &amp; Circadian Balance
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              WOMEN&apos;S HEALTH &amp; CYCLE SYNCHRONIZATION
            </h1>
            <p className="text-[#586151] text-xs sm:text-sm m-0 mt-1">
              Phase-matched nutrition, energy pacing, and symptom biomarkers for holistic vitality.
            </p>
          </div>

          <Link
            href="/cycle-tracker"
            className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white text-xs px-4 py-2.5 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center no-underline shadow-sm"
          >
            <Calendar size={14} />
            Open Full Cycle Calendar
          </Link>
        </div>
      </div>

      {/* Cycle Phase Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phase Card */}
        <div className="fluetas-card p-5 flex flex-col justify-between gap-3 bg-[#FDF2F8] border-[#C23B6B]/30">
          <div>
            <span className="text-[0.68rem] font-bold text-[#C23B6B] uppercase tracking-wider block mb-1">
              Current Cycle Phase
            </span>
            <h2 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">
              Day {currentDay} · {phase}
            </h2>
            <p className="text-xs text-[#2E6DA4] font-semibold mt-1">
              {daysToOvulation} days to Estimated Ovulation
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-[rgba(18,22,15,0.08)] text-xs text-[#586151]">
            <strong className="text-[#12160F] block mb-0.5">Estrogen &amp; Energy Rising</strong>
            Optimal phase for high-intensity lifting, endurance pacing, and complex carbohydrate absorption.
          </div>
        </div>

        {/* Phase Recommendations */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-3">
          <span className="section-title">TODAY&apos;S PHASE NUTRITION &amp; TRAINING SYNC</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl">
              <span className="text-[0.65rem] font-bold text-[#2E7D32] uppercase block mb-1">Exercise Focus</span>
              <p className="font-bold text-[#12160F] m-0 text-sm">Strength &amp; Heavy Lifts</p>
              <p className="text-[#586151] m-0 mt-1">Higher pain tolerance &amp; insulin sensitivity during follicular surge.</p>
            </div>

            <div className="p-3 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl">
              <span className="text-[0.65rem] font-bold text-[#D97706] uppercase block mb-1">Dietary Focus</span>
              <p className="font-bold text-[#12160F] m-0 text-sm">Cruciferous Veggies &amp; Clean Protein</p>
              <p className="text-[#586151] m-0 mt-1">Supports liver estrogen clearance; pair with healthy omega-3 fats.</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(18,22,15,0.08)]">
            <span className="text-[#586151]">Need expert medical advice for cycle health?</span>
            <Link href="/experts" className="text-[#C23B6B] font-semibold flex items-center gap-1 hover:underline no-underline">
              Consult Gynecologist <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* HER+ Product Tie-In Banner */}
      <div className="fluetas-card p-5 bg-[#FDF2F8] border-[#C23B6B]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C23B6B]/10 border border-[#C23B6B]/20 flex items-center justify-center text-3xl shrink-0">
            ♀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
                FLUETAS HER+ SUPERFRUIT ELIXIR
              </h3>
              <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#C23B6B]/10 text-[#C23B6B]">
                Formulation
              </span>
            </div>
            <p className="text-xs text-[#586151] m-0 mt-1 max-w-xl">
              Myo-Inositol, Shatavari, Organic Tart Cherry &amp; Chasteberry extract to support ovulatory regularity and menstrual ease.
            </p>
          </div>
        </div>

        <Link
          href="/products?product=her"
          className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white text-xs px-4 py-2 rounded-lg no-underline shrink-0 self-stretch sm:self-auto text-center font-bold"
        >
          Explore HER+ Formula
        </Link>
      </div>

      {/* Quick Navigation into Specialized Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/cycle-tracker"
          className="fluetas-card p-4 flex items-center justify-between hover:shadow-md transition-shadow no-underline group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C23B6B]/10 text-[#C23B6B] flex items-center justify-center text-lg">
              🩸
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm text-[#12160F] m-0 group-hover:text-[#C23B6B] transition-colors">
                Full Cycle Tracker &amp; Calendar
              </h3>
              <p className="text-xs text-[#586151] m-0 mt-0.5">Log flow, PMS symptoms &amp; ovulation tests</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8A9482] group-hover:text-[#C23B6B] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/symptoms"
          className="fluetas-card p-4 flex items-center justify-between hover:shadow-md transition-shadow no-underline group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center text-lg">
              🩺
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm text-[#12160F] m-0 group-hover:text-[#2E6DA4] transition-colors">
                Symptom Frequency Log
              </h3>
              <p className="text-xs text-[#586151] m-0 mt-0.5">Track cramps, mood fluctuations &amp; bloating</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#8A9482] group-hover:text-[#2E6DA4] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
