'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, ChevronRight, ChevronLeft, User, Target, Heart, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Information', subtitle: 'Tell us about yourself', icon: User },
  { id: 2, title: 'Wellness Goals', subtitle: 'Personalize your journey', icon: Target },
  { id: 3, title: 'Health Background', subtitle: 'Optional — skip if preferred', icon: Heart },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const GOALS = ['Build Muscle', 'Lose Weight', 'Improve Fitness', 'Better Health', 'Stress Management', 'Sports Performance'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];
const ACTIVITY_LEVELS = ['Sedentary (desk job)', 'Lightly active (1-2x/week)', 'Moderately active (3-4x/week)', 'Active (5+x/week)'];
const DIETARY_PREFS = ['No Preference', 'Vegetarian', 'Vegan', 'High Protein', 'Keto / Low Carb', 'Gluten Free'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Basic Info
  const [name, setName] = useState(user?.displayName ?? '');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Step 2 — Wellness
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [dietaryPref, setDietaryPref] = useState('');
  const [sleepTargetHrs, setSleepTargetHrs] = useState('8');
  const [hydrationTargetL, setHydrationTargetL] = useState('2.5');

  // Step 3 — Health (optional)
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  const validateStep1 = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!dob) return 'Please enter your date of birth.';
    // Basic dob sanity check
    const dobDate = new Date(dob);
    const now = new Date();
    const age = (now.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (age < 13 || age > 120) return 'Please enter a valid date of birth.';
    if (!gender) return 'Please select your gender.';
    if (heightCm && (Number(heightCm) < 50 || Number(heightCm) > 300)) return 'Please enter a valid height (50–300 cm).';
    if (weightKg && (Number(weightKg) < 20 || Number(weightKg) > 500)) return 'Please enter a valid weight (20–500 kg).';
    return '';
  };

  const validateStep2 = () => {
    if (!primaryGoal) return 'Please select your primary goal.';
    if (!fitnessLevel) return 'Please select your fitness level.';
    return '';
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep(s => s + 1);
  };

  const handleComplete = async () => {
    if (!user || !db) return;
    setSaving(true);
    setError('');

    try {
      // Update user document
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        dob,
        gender,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        bloodGroup: bloodGroup || null,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Create health profile document
      await setDoc(doc(db, 'users', user.uid, 'healthProfile', 'main'), {
        primaryGoal,
        fitnessLevel,
        activityLevel,
        dietaryPreference: dietaryPref,
        sleepTargetHrs: Number(sleepTargetHrs) || 8,
        hydrationTargetL: Number(hydrationTargetL) || 2.5,
        allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        chronicConditions: conditions ? conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        currentMedications: medications ? medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: emergencyName.trim() ? {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relationship: emergencyRel.trim(),
        } : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Create profile-created timeline event
      await setDoc(doc(db, 'users', user.uid, 'healthTimeline', `profile_created_${Date.now()}`), {
        type: 'profile_created',
        title: 'FLUETAS Profile Created',
        description: `Welcome to FLUETAS! Your health journey begins here.`,
        category: 'System',
        timestamp: serverTimestamp(),
        badge: 'Milestone',
      });

      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.round(((step - 1) / 3) * 100);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #0B0D14 50%, #07080E 100%)' }}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo + Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif' }}>F</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: '#E8EAF6' }}>FLUETAS</span>
          </div>
          <p className="text-[#8B91B0] text-sm">Complete your profile to get started</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-6 px-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-[#10B981]' : isActive ? 'bg-[#10B981]/20 border border-[#10B981]' : 'bg-[#13161F] border border-[#1E2133]'}`}>
                    {isDone ? <CheckCircle2 size={17} className="text-white" /> : <Icon size={16} className={isActive ? 'text-[#10B981]' : 'text-[#3A3F58]'} />}
                  </div>
                  <span className={`text-[0.6rem] font-semibold hidden sm:block ${isActive ? 'text-[#10B981]' : isDone ? 'text-[#10B981]/70' : 'text-[#3A3F58]'}`}>
                    {s.title.split(' ')[0]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-[2px] rounded-full transition-all ${step > s.id ? 'bg-[#10B981]' : 'bg-[#1E2133]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 shadow-2xl">
          <div className="mb-5">
            <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6]">{STEPS[step - 1].title}</h2>
            <p className="text-[#8B91B0] text-xs mt-0.5">{STEPS[step - 1].subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Date of Birth *</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Gender *</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors">
                    <option value="">Select...</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Height (cm)</label>
                  <input type="number" min="50" max="300" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="175" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Weight (kg)</label>
                  <input type="number" min="20" max="500" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="70" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Blood Group</label>
                  <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors">
                    <option value="">—</option>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Wellness Goals ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-medium mb-2">Primary Goal *</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button key={g} type="button" onClick={() => setPrimaryGoal(g)} className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${primaryGoal === g ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6]'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-2">Fitness Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_LEVELS.map(f => (
                    <button key={f} type="button" onClick={() => setFitnessLevel(f)} className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${fitnessLevel === f ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]' : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6]'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-2">Activity Level</label>
                <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors">
                  <option value="">Select...</option>
                  {ACTIVITY_LEVELS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-2">Dietary Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIETARY_PREFS.map(d => (
                    <button key={d} type="button" onClick={() => setDietaryPref(d)} className={`p-2 rounded-lg text-[0.7rem] font-semibold border transition-all cursor-pointer ${dietaryPref === d ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]' : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6]'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Sleep Target (hrs/night)</label>
                  <input type="number" min="4" max="12" step="0.5" value={sleepTargetHrs} onChange={e => setSleepTargetHrs(e.target.value)} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">Hydration Target (L/day)</label>
                  <input type="number" min="1" max="6" step="0.5" value={hydrationTargetL} onChange={e => setHydrationTargetL(e.target.value)} className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Optional Health Info ── */}
          {step === 3 && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl text-[#38BDF8] text-[0.72rem]">
                This information is optional and stored securely. It helps personalize your experience and can be shared with experts during consultations (with your consent only).
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Known Allergies <span className="text-[#3A3F58]">(comma separated)</span></label>
                <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Peanuts, Penicillin, Shellfish" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Existing Conditions <span className="text-[#3A3F58]">(comma separated)</span></label>
                <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="e.g. Hypothyroidism, PCOS, None" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Current Medications <span className="text-[#3A3F58]">(comma separated)</span></label>
                <input value={medications} onChange={e => setMedications(e.target.value)} placeholder="e.g. Vitamin D, Metformin" className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>

              <div className="pt-2 border-t border-[#1E2133]">
                <label className="block text-[#8B91B0] font-medium mb-2">Emergency Contact <span className="text-[#3A3F58]">(optional)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Full name" className="bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                  <input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="Phone number" className="bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                  <input value={emergencyRel} onChange={e => setEmergencyRel(e.target.value)} placeholder="Relationship" className="bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#10B981] focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-3">
            {step > 1 ? (
              <button onClick={() => { setError(''); setStep(s => s - 1); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0D14] border border-[#1E2133] text-[#8B91B0] text-xs font-semibold hover:text-white transition-colors cursor-pointer">
                <ChevronLeft size={15} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)] hover:opacity-90 transition-all cursor-pointer">
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)] hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={15} /> Complete Profile</>}
              </button>
            )}
          </div>

          {step === 3 && (
            <button onClick={handleComplete} disabled={saving} className="w-full mt-2 text-[#3A3F58] text-[0.72rem] hover:text-[#8B91B0] transition-colors cursor-pointer">
              Skip optional fields and go to dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
