'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { addTimelineEvent } from '@/lib/services/timelineService';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Activity,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'About You', subtitle: 'Basic info', icon: User },
  { id: 2, title: 'Your Fitness', subtitle: 'Goals & activity', icon: Activity },
  { id: 3, title: 'Health & Done', subtitle: 'Safety & review', icon: ShieldCheck },
];

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const GOALS = [
  { id: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { id: 'lose_weight', label: 'Lose Weight', emoji: '🔥' },
  { id: 'strength', label: 'Get Stronger', emoji: '🏋️' },
  { id: 'endurance', label: 'Improve Stamina', emoji: '🏃' },
  { id: 'general_fitness', label: 'General Health', emoji: '💚' },
  { id: 'mobility', label: 'Flexibility', emoji: '🧘' },
];
const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Mostly sitting' },
  { id: 'lightly_active', label: 'Lightly Active', desc: 'Walk sometimes' },
  { id: 'moderately_active', label: 'Active', desc: 'Workout 3-4x/week' },
  { id: 'very_active', label: 'Very Active', desc: 'Intense daily' },
];
const INJURY_OPTIONS = [
  { id: 'knee', label: 'Knee' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'back', label: 'Back' },
  { id: 'ankle', label: 'Ankle' },
  { id: 'wrist', label: 'Wrist' },
  { id: 'neck', label: 'Neck' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: About You
  const [name, setName] = useState(user?.displayName ?? '');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Step 2: Your Fitness
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(4);

  // Step 3: Health
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const draftKey = `fluetas_draft_${user.uid}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.dob) setDob(d.dob);
        if (d.gender) setGender(d.gender);
        if (d.heightCm) setHeightCm(d.heightCm);
        if (d.weightKg) setWeightKg(d.weightKg);
        if (d.primaryGoal) setPrimaryGoal(d.primaryGoal);
        if (d.activityLevel) setActivityLevel(d.activityLevel);
        if (d.daysPerWeek) setDaysPerWeek(d.daysPerWeek);
        if (d.selectedInjuries) setSelectedInjuries(d.selectedInjuries);
        if (d.step) setStep(d.step);
      } catch {}
    }
  }, [user]);

  const saveDraft = (nextStep?: number) => {
    if (!user) return;
    const draftKey = `fluetas_draft_${user.uid}`;
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        name, dob, gender, heightCm, weightKg,
        primaryGoal, activityLevel, daysPerWeek, selectedInjuries,
        step: nextStep || step,
      }));
    } catch {}
  };

  const toggleInjury = (id: string) => {
    setSelectedInjuries(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const validate = (): string | null => {
    if (step === 1) {
      if (!name.trim()) return 'Please enter your name.';
      if (!dob) return 'Please enter your date of birth.';
      if (!gender) return 'Please select your gender.';
      if (!heightCm || Number(heightCm) < 100 || Number(heightCm) > 260) return 'Enter a valid height (100-260 cm).';
      if (!weightKg || Number(weightKg) < 30 || Number(weightKg) > 350) return 'Enter a valid weight (30-350 kg).';
    }
    if (step === 2) {
      if (!primaryGoal) return 'Please select your goal.';
      if (!activityLevel) return 'Please select your activity level.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    const next = step + 1;
    setStep(next);
    saveDraft(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setError('');
    const prev = Math.max(1, step - 1);
    setStep(prev);
    saveDraft(prev);
  };

  const handleComplete = async () => {
    if (!user || !db) return;
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError('');

    try {
      const now = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email || '',
        dob,
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        role: 'customer',
        onboardingComplete: true,
        updatedAt: now,
      }, { merge: true });

      await setDoc(doc(db, 'users', user.uid, 'healthProfile', 'main'), {
        primaryGoal,
        fitnessLevel: activityLevel === 'very_active' ? 'Advanced' : activityLevel === 'moderately_active' ? 'Intermediate' : 'Beginner',
        activityLevel,
        daysPerWeek,
        preferredSessionDuration: 45,
        equipmentAccess: 'full_gym',
        workoutLocation: 'commercial_gym',
        injuryTags: selectedInjuries,
        injuries: selectedInjuries,
        dietaryPreference: 'No Preference',
        sleepTargetHrs: 8,
        hydrationTargetL: 2.5,
        onboardingCompletedAt: now,
        updatedAt: now,
      }, { merge: true });

      await addTimelineEvent(user.uid, {
        type: 'profile_created',
        title: 'Profile Created',
        description: `Goal: ${primaryGoal} · ${daysPerWeek} days/week`,
        category: 'Wellness',
        badge: 'Active',
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem(`fluetas_draft_${user.uid}`);
      }

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full flex flex-col gap-5 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <img src="/assets/image.png" alt="FLUETAS" className="w-9 h-9 object-contain" />
            <span className="font-['Outfit'] text-2xl font-black text-[#12160F]">FLUETAS</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl font-black text-[#12160F] m-0">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-sm text-[#586151] m-0 mt-0.5">
            Step {step} of {STEPS.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {STEPS.map(s => (
            <div key={s.id} className="flex-1">
              <div className={`h-2 rounded-full transition-all ${
                step > s.id ? 'bg-[#2E7D32]' : step === s.id ? 'bg-[#12160F]' : 'bg-[#E8EBE4]'
              }`} />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[rgba(18,22,15,0.08)] shadow-sm">
          {/* STEP 1: About You */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none focus:border-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none focus:border-[#2E7D32]"
                  >
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="260"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    placeholder="175"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none focus:border-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="350"
                    step="0.1"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    placeholder="72"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Your Fitness */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-2">What's your main goal?</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        primaryGoal === g.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <span className="text-lg">{g.emoji}</span>
                      <p className="font-bold text-[#12160F] m-0 mt-1">{g.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">How active are you?</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_LEVELS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivityLevel(item.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        activityLevel === item.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="font-bold text-[#12160F] m-0">{item.label}</p>
                      <p className="text-[0.68rem] text-[#586151] m-0">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Days per week?</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysPerWeek(days)}
                      className={`flex-1 p-3 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                        daysPerWeek === days
                          ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6]'
                      }`}
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Health & Review */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-2">Any injuries? (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {INJURY_OPTIONS.map(opt => {
                    const isSelected = selectedInjuries.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInjury(opt.id)}
                        className={`px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#586151]'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.65rem] text-[#8A9482] mt-2 m-0">
                  We'll adjust your workouts to avoid these areas.
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] space-y-2">
                <p className="font-bold text-[#12160F] m-0 text-sm">Your Profile</p>
                <div className="grid grid-cols-2 gap-2 text-[#586151]">
                  <p className="m-0">{name} · {gender}</p>
                  <p className="m-0">{heightCm}cm · {weightKg}kg</p>
                  <p className="m-0">{GOALS.find(g => g.id === primaryGoal)?.label || primaryGoal}</p>
                  <p className="m-0">{daysPerWeek} days/week</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[rgba(18,22,15,0.08)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] hover:bg-[#FAFAF6] flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#12160F] hover:bg-[#25201A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle2 size={15} /> Get Started</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
