'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Droplets,
  Heart,
  Activity,
  Zap,
  Thermometer,
  TestTube,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  DailyCycleLog,
  BleedingFlow,
  MoodType,
  EnergyType,
  CervicalMucus,
  LHTestResult,
  CYCLE_SYMPTOMS_LIST,
} from '@/lib/cycle/types';

interface DayLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
  cycleDayNumber?: number | null;
  phaseName?: string;
  existingLog?: DailyCycleLog | null;
  onSaveLog: (logData: {
    date: string;
    flow?: BleedingFlow;
    symptoms?: string[];
    mood?: MoodType;
    energy?: EnergyType;
    cervicalMucus?: CervicalMucus;
    bbt?: number;
    lhTest?: LHTestResult;
    notes?: string;
  }) => Promise<void>;
  onDeleteLog: (dateStr: string) => Promise<void>;
}

const FLOW_OPTIONS: { id: BleedingFlow; label: string; desc: string; color: string }[] = [
  { id: 'none', label: 'None', desc: 'No bleeding', color: '#8A9482' },
  { id: 'spotting', label: 'Spotting', desc: 'Minimal drops', color: '#E11D48' },
  { id: 'light', label: 'Light', desc: 'Light pad / tampon', color: '#E11D48' },
  { id: 'moderate', label: 'Moderate', desc: 'Regular flow', color: '#BE123C' },
  { id: 'heavy', label: 'Heavy', desc: 'Heavy protection', color: '#9F1239' },
];

const MOOD_OPTIONS: { id: MoodType; label: string; icon: string }[] = [
  { id: 'good', label: 'Good', icon: '😊' },
  { id: 'neutral', label: 'Neutral', icon: '😐' },
  { id: 'low', label: 'Low', icon: '😔' },
  { id: 'anxious', label: 'Anxious', icon: '😰' },
  { id: 'irritable', label: 'Irritable', icon: '😤' },
  { id: 'mood_swings', label: 'Mood Swings', icon: '🌪️' },
];

const ENERGY_OPTIONS: { id: EnergyType; label: string; color: string }[] = [
  { id: 'high', label: 'High Energy', color: '#2E7D32' },
  { id: 'normal', label: 'Normal Energy', color: '#2E6DA4' },
  { id: 'low', label: 'Low / Fatigued', color: '#D97706' },
];

const MUCUS_OPTIONS: { id: CervicalMucus; label: string }[] = [
  { id: 'dry', label: 'Dry' },
  { id: 'sticky', label: 'Sticky' },
  { id: 'creamy', label: 'Creamy' },
  { id: 'watery', label: 'Watery' },
  { id: 'egg_white', label: 'Egg White (Fertile)' },
];

export default function DayLogDrawer({
  isOpen,
  onClose,
  dateStr,
  cycleDayNumber,
  phaseName,
  existingLog,
  onSaveLog,
  onDeleteLog,
}: DayLogDrawerProps) {
  const [flow, setFlow] = useState<BleedingFlow>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [energy, setEnergy] = useState<EnergyType | undefined>(undefined);
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | undefined>(undefined);
  const [bbt, setBbt] = useState<string>('');
  const [lhTest, setLhTest] = useState<LHTestResult>('not_tested');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'none');
      setSymptoms(existingLog.symptoms || []);
      setMood(existingLog.mood);
      setEnergy(existingLog.energy);
      setCervicalMucus(existingLog.cervicalMucus);
      setBbt(existingLog.bbt !== undefined ? String(existingLog.bbt) : '');
      setLhTest(existingLog.lhTest || 'not_tested');
      setNotes(existingLog.notes || '');
    } else {
      setFlow('none');
      setSymptoms([]);
      setMood(undefined);
      setEnergy(undefined);
      setCervicalMucus(undefined);
      setBbt('');
      setLhTest('not_tested');
      setNotes('');
    }
    setSaveSuccess(false);
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveLog({
        date: dateStr,
        flow,
        symptoms,
        mood,
        energy,
        cervicalMucus,
        bbt: bbt ? Number(bbt) : undefined,
        lhTest,
        notes,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 750);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Clear all cycle and symptom records for this date?')) return;
    setDeleting(true);
    try {
      await onDeleteLog(dateStr);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[rgba(18,22,15,0.12)] shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Outfit'] text-base sm:text-lg font-black text-[#12160F] m-0">
                {formattedDate}
              </h2>
              {saveSuccess && (
                <span className="text-[0.68rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <CheckCircle2 size={12} /> Saved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {cycleDayNumber ? (
                <span className="text-xs font-bold text-[#C23B6B]">
                  Cycle Day {cycleDayNumber}
                </span>
              ) : null}
              {phaseName && phaseName !== 'Unknown' ? (
                <span className="text-[0.68rem] text-[#586151]">
                  · Estimated {phaseName} Phase
                </span>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#586151] hover:text-[#12160F] hover:bg-black/5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* 1. PERIOD / BLEEDING FLOW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#12160F]">
                <Droplets size={14} className="text-[#C23B6B]" />
                <span>Period / Bleeding Flow</span>
              </div>
              {flow !== 'none' && (
                <button
                  type="button"
                  onClick={() => setFlow('none')}
                  className="text-[0.65rem] text-[#8A9482] hover:underline"
                >
                  Clear flow
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {FLOW_OPTIONS.map(opt => {
                const isSelected = flow === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFlow(opt.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[58px] ${
                      isSelected
                        ? 'border-[#C23B6B] bg-[#FDF2F8] text-[#C23B6B] font-bold shadow-xs'
                        : 'border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] text-[#586151] hover:text-[#12160F] hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[0.58rem] opacity-75 mt-0.5 truncate">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SYMPTOMS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#12160F]">
                <Activity size={14} className="text-[#2E7D32]" />
                <span>Physical &amp; Hormonal Symptoms</span>
              </div>
              <span className="text-[0.65rem] text-[#8A9482]">{symptoms.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CYCLE_SYMPTOMS_LIST.map(sym => {
                const isSelected = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white font-bold border-[#2E7D32] shadow-xs'
                        : 'bg-[#FAFAF6] text-[#586151] border-[rgba(18,22,15,0.08)] hover:text-[#12160F] hover:bg-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sym.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MOOD */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#12160F]">
              <Heart size={14} className="text-[#7A4E9E]" />
              <span>Mood State</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {MOOD_OPTIONS.map(opt => {
                const isSelected = mood === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMood(isSelected ? undefined : opt.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#7A4E9E] bg-[#FAF5FF] text-[#7A4E9E] font-bold shadow-xs'
                        : 'border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] text-[#586151] hover:text-[#12160F]'
                    }`}
                  >
                    <span className="text-base mb-0.5">{opt.icon}</span>
                    <span className="text-[0.65rem]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. ENERGY */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#12160F]">
              <Zap size={14} className="text-[#D97706]" />
              <span>Energy Level</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ENERGY_OPTIONS.map(opt => {
                const isSelected = energy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnergy(isSelected ? undefined : opt.id)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D97706] bg-[#FFFBEB] text-[#D97706] shadow-xs'
                        : 'border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] text-[#586151] hover:text-[#12160F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. CLINICAL OBSERVATIONS (Mucus, BBT, LH Test) */}
          <div className="p-3.5 rounded-2xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-3">
            <span className="text-[0.68rem] font-bold text-[#12160F] uppercase tracking-wider block">
              Biomarkers &amp; Clinical Observations
            </span>

            {/* Cervical Mucus */}
            <div>
              <label className="block text-[0.68rem] text-[#586151] mb-1 font-semibold">
                Cervical Fluid / Mucus
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MUCUS_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCervicalMucus(cervicalMucus === m.id ? undefined : m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold border cursor-pointer ${
                      cervicalMucus === m.id
                        ? 'bg-[#2E6DA4] text-white border-[#2E6DA4]'
                        : 'bg-white text-[#586151] border-[rgba(18,22,15,0.10)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LH / Ovulation Test Result */}
            <div>
              <label className="block text-[0.68rem] text-[#586151] mb-1 font-semibold">
                Ovulation Test (LH Surge)
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'not_tested', label: 'Not Tested' },
                  { id: 'negative', label: 'Negative (-)' },
                  { id: 'positive', label: 'Positive (+) LH Peak' },
                ].map(lh => (
                  <button
                    key={lh.id}
                    type="button"
                    onClick={() => setLhTest(lh.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      lhTest === lh.id
                        ? lh.id === 'positive'
                          ? 'bg-[#7A4E9E] text-white border-[#7A4E9E]'
                          : 'bg-[#12160F] text-white border-[#12160F]'
                        : 'bg-white text-[#586151] border-[rgba(18,22,15,0.10)]'
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BBT */}
            <div className="max-w-[200px]">
              <label className="block text-[0.68rem] text-[#586151] mb-1 font-semibold">
                Basal Body Temp (°C)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 36.45"
                value={bbt}
                onChange={e => setBbt(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] text-xs text-[#12160F] outline-none"
              />
            </div>
          </div>

          {/* 6. NOTES */}
          <div className="space-y-1">
            <label className="block text-[0.68rem] font-bold text-[#586151]">Daily Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add personal notes on symptoms, medications, or life factors..."
              className="w-full p-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-xs text-[#12160F] outline-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-[rgba(18,22,15,0.08)] bg-white flex items-center justify-between shrink-0">
          {existingLog ? (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="p-2 rounded-xl text-[#8A9482] hover:text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-1.5"
              title="Delete Day Log"
            >
              <Trash2 size={15} />
              <span className="text-xs font-semibold">Clear Log</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151] hover:text-[#12160F]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white px-6 py-2 text-xs font-bold rounded-xl shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
