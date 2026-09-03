'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Bell,
  Cpu,
  HeartPulse,
} from 'lucide-react';

export default function AICoachPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#7A4E9E]/10 text-[#7A4E9E] border border-[#7A4E9E]/25 flex items-center gap-1">
            <Sparkles size={11} />
            Coming Soon · Research &amp; Clinical Evaluation
          </span>
        </div>
        <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#12160F] m-0">
          FLUETAS AI PERFORMANCE COACH
        </h1>
        <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1 max-w-xl">
          Next-generation biometric reasoning engine for metabolic analysis, form biomechanics, and clinical doctor handoffs.
        </p>
      </div>

      {/* Main Feature Preview Card */}
      <div className="fluetas-card p-6 sm:p-8 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#7A4E9E]/10 text-[#7A4E9E] flex items-center justify-center text-3xl shadow-xs">
          <Bot size={32} />
        </div>

        <div className="max-w-lg space-y-2">
          <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            Intelligent Health Reasoning Under Active Development
          </h2>
          <p className="text-xs sm:text-sm text-[#586151] m-0 leading-relaxed">
            FLUETAS AI is being built to securely interpret your continuous biometric telemetry, validate workout progressions, and assist your licensed clinical practitioner during telehealth consults.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left">
          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#7A4E9E] font-bold text-xs">
              <Cpu size={14} />
              <span>Biometric Synthesis</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Cross-references hydration, volume load, and sleep telemetry against evidence-based recovery curves.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2E7D32] font-bold text-xs">
              <ShieldCheck size={14} />
              <span>Safety Screening</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Detects joint sensitivity patterns and automatically suggests orthopedic substitutions in real time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2E6DA4] font-bold text-xs">
              <Stethoscope size={14} />
              <span>Doctor Handoff</span>
            </div>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Packages diagnostic document trends and symptoms for your physician review before appointments.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/consultations"
            className="btn-primary bg-[#12160F] hover:bg-[#25201A] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 no-underline transition-colors shadow-xs"
          >
            <Stethoscope size={15} />
            <span>Consult a Verified Medical Practitioner Today</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
