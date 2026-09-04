'use client';

import React, { useState } from 'react';
import { X, CalendarHeart, Sparkles, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { CycleSettings, CycleFactor } from '@/lib/cycle/types';

interface CycleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: CycleSettings | null;
  onSave: (settings: Partial<CycleSettings>) => Promise<void>;
}

export default function CycleSetupModal({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: CycleSetupModalProps) {
  const [lastPeriodDate, setLastPeriodDate] = useState(
    initialSettings?.lastPeriodStartDate || ''
  );
  const [periodDuration, setPeriodDuration] = useState<number | null>(
    initialSettings?.typicalPeriodDurationDays || 5
  );
  const [periodDurationUnknown, setPeriodDurationUnknown] = useState(
    !initialSettings?.typicalPeriodDurationDays && initialSettings?.configured
  );

  const [cycleLength, setCycleLength] = useState<number | null>(
    initialSettings?.typicalCycleLengthDays || 29
  );
  const [cycleLengthUnknown, setCycleLengthUnknown] = useState(
    !initialSettings?.typicalCycleLengthDays && initialSettings?.configured
  );

  const [regularity, setRegularity] = useState<boolean | 'unknown'>(
    initialSettings?.isRegular ?? true
  );

  const [activeFactors, setActiveFactors] = useState<CycleFactor[]>(
    initialSettings?.activeFactors || ['none']
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleFactor = (factor: CycleFactor) => {
    if (factor === 'none') {
      setActiveFactors(['none']);
      return;
    }
    setActiveFactors(prev => {
      const filtered = prev.filter(f => f !== 'none');
      if (filtered.includes(factor)) {
        const next = filtered.filter(f => f !== factor);
        return next.length === 0 ? ['none'] : next;
      } else {
        return [...filtered, factor];
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Partial<CycleSettings> = {
        isRegular: regularity,
        activeFactors,
        configured: true,
      };

      if (lastPeriodDate && lastPeriodDate.trim() !== '') {
        payload.lastPeriodStartDate = lastPeriodDate.trim();
      }
      if (!periodDurationUnknown && periodDuration) {
        payload.typicalPeriodDurationDays = Number(periodDuration);
      }
      if (!cycleLengthUnknown && cycleLength) {
        payload.typicalCycleLengthDays = Number(cycleLength);
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save cycle settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white border border-[rgba(18,22,15,0.12)] rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[rgba(18,22,15,0.08)] bg-[#FDF2F8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C23B6B] text-white flex items-center justify-center shadow-xs">
              <CalendarHeart size={20} />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-base sm:text-lg font-black text-[#12160F] m-0">
                CYCLE TRACKING SETUP
              </h2>
              <p className="text-xs text-[#586151] m-0">
                Configure baseline parameters to calibrate your personalized calendar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#586151] hover:text-[#12160F] hover:bg-white/60 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Last Period Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#12160F]">
              When did your last period start? (First day of bleeding)
            </label>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Used as the starting anchor for your current cycle day and upcoming phase calculations.
            </p>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={e => setLastPeriodDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-xs text-[#12160F] font-semibold outline-none focus:border-[#C23B6B]"
            />
          </div>

          {/* 2. Typical Period Duration */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#12160F]">
                Typical Period Duration (Bleeding Days)
              </label>
              <button
                type="button"
                onClick={() => setPeriodDurationUnknown(!periodDurationUnknown)}
                className={`text-[0.68rem] font-bold px-2 py-0.5 rounded cursor-pointer ${
                  periodDurationUnknown
                    ? 'bg-[#C23B6B] text-white'
                    : 'bg-white border border-[rgba(18,22,15,0.12)] text-[#586151]'
                }`}
              >
                I don&apos;t know
              </button>
            </div>

            {!periodDurationUnknown && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-['Outfit'] font-bold text-sm text-[#C23B6B]">
                  <span>{periodDuration || 5} days</span>
                  <span className="text-[0.68rem] text-[#586151] font-normal">Typical: 3–7 days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={periodDuration || 5}
                  onChange={e => setPeriodDuration(Number(e.target.value))}
                  className="w-full accent-[#C23B6B] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 3. Typical Cycle Length */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#12160F]">
                Typical Cycle Length (Period Start to Next Period Start)
              </label>
              <button
                type="button"
                onClick={() => setCycleLengthUnknown(!cycleLengthUnknown)}
                className={`text-[0.68rem] font-bold px-2 py-0.5 rounded cursor-pointer ${
                  cycleLengthUnknown
                    ? 'bg-[#C23B6B] text-white'
                    : 'bg-white border border-[rgba(18,22,15,0.12)] text-[#586151]'
                }`}
              >
                I don&apos;t know
              </button>
            </div>

            {!cycleLengthUnknown && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-['Outfit'] font-bold text-sm text-[#C23B6B]">
                  <span>{cycleLength || 29} days</span>
                  <span className="text-[0.68rem] text-[#586151] font-normal">Normal range: 21–38 days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  step="1"
                  value={cycleLength || 29}
                  onChange={e => setCycleLength(Number(e.target.value))}
                  className="w-full accent-[#C23B6B] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 4. Regularity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#12160F]">
              Are your menstrual cycles usually regular?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: true, label: 'Yes, Regular' },
                { val: false, label: 'Variable / Irregular' },
                { val: 'unknown', label: 'Not Sure' },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => setRegularity(opt.val as any)}
                  className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    regularity === opt.val
                      ? 'border-[#C23B6B] bg-[#FDF2F8] text-[#C23B6B] font-bold shadow-xs'
                      : 'border-[rgba(18,22,15,0.10)] bg-white text-[#586151] hover:text-[#12160F]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Cycle Factors (Contraception, Pregnancy, Lactation) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-[#12160F]">
              Cycle Factors &amp; Medical Context (Optional)
            </label>
            <p className="text-[0.68rem] text-[#586151] m-0">
              Hormonal factors alter ovulation patterns. Selecting these prevents inappropriate fertility predictions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { id: 'none', label: 'No Factors' },
                { id: 'hormonal_contraception', label: 'Hormonal Contraceptive' },
                { id: 'pregnancy', label: 'Pregnant' },
                { id: 'lactation', label: 'Lactating' },
              ].map(fac => {
                const active = activeFactors.includes(fac.id as CycleFactor);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => toggleFactor(fac.id as CycleFactor)}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer text-[0.68rem] transition-all ${
                      active
                        ? 'border-[#C23B6B] bg-[#FDF2F8] text-[#C23B6B] font-bold'
                        : 'border-[rgba(18,22,15,0.10)] bg-white text-[#586151] hover:text-[#12160F]'
                    }`}
                  >
                    {active && '✓ '}
                    {fac.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151] hover:text-[#12160F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white px-6 py-2 text-xs font-bold rounded-xl shadow-xs"
            >
              {saving ? 'Saving...' : 'Save & Calibrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
