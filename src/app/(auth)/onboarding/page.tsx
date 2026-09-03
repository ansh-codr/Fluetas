'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { addTimelineEvent } from '@/lib/services/timelineService';
import {
  EquipmentAccess,
  InjuryTag,
  WorkoutLocation,
  ExperienceLevel,
  calculateProfileCompleteness,
} from '@/lib/services/userService';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Activity,
  MapPin,
  ShieldCheck,
  Target,
  FileCheck,
  Loader2,
  AlertTriangle,
  Heart,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Information', subtitle: 'Identity & biometrics', icon: User },
  { id: 2, title: 'Body & Fitness', subtitle: 'Activity & training level', icon: Activity },
  { id: 3, title: 'Lifestyle & Location', subtitle: 'Frequency, time & apparatus', icon: MapPin },
  { id: 4, title: 'Health & Safety', subtitle: 'Injury & medical screening', icon: ShieldCheck },
  { id: 5, title: 'Goals & Preferences', subtitle: 'Primary target & nutrition', icon: Target },
  { id: 6, title: 'Review & Confirm', subtitle: 'Verify & activate profile', icon: FileCheck },
];

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Novice (0 – 1 Year)', desc: 'Learning foundational movement patterns' },
  { id: 'intermediate', label: 'Intermediate (1 – 3 Years)', desc: 'Consistent training with progressive loading' },
  { id: 'advanced', label: 'Advanced (3 – 5 Years)', desc: 'Solid technical mastery & periodization' },
  { id: 'athlete', label: 'Elite / Athlete (5+ Years)', desc: 'High volume & sport-specific conditioning' },
];
const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal daily movement' },
  { id: 'lightly_active', label: 'Lightly Active', desc: '1–2 light workouts or daily walking' },
  { id: 'moderately_active', label: 'Moderately Active', desc: '3–4 structured workouts per week' },
  { id: 'very_active', label: 'Very Active', desc: '5+ intense workouts or physical labor' },
];
const GOALS = [
  { id: 'build_muscle', label: 'Build Muscle & Hypertrophy', desc: 'Maximize muscular architecture & size' },
  { id: 'lose_weight', label: 'Fat Loss & Metabolic Conditioning', desc: 'Caloric burn & lean body composition' },
  { id: 'strength', label: 'Absolute Strength & Power', desc: 'Heavy compound barbell performance' },
  { id: 'endurance', label: 'Cardio & Muscular Stamina', desc: 'Aerobic capacity & high-rep endurance' },
  { id: 'general_fitness', label: 'General Health & Longevity', desc: 'Functional vitality & posture' },
  { id: 'mobility', label: 'Joint Mobility & Restoration', desc: 'Flexibility & pain-free movement' },
];
const WORKOUT_LOCATIONS: { id: WorkoutLocation; label: string; desc: string; icon: string }[] = [
  { id: 'home', label: 'Home Gym', desc: 'Living room, garage, or dedicated home setup', icon: '🏠' },
  { id: 'commercial_gym', label: 'Commercial Gym', desc: 'Full facility with barbells, machines & cables', icon: '🏋️' },
  { id: 'outdoors', label: 'Outdoors & Calisthenics', desc: 'Parks, track, bodyweight bars', icon: '🌳' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Mix of home, gym, and outdoor training', icon: '🔄' },
];
const EQUIPMENT_OPTIONS: { id: EquipmentAccess; title: string; desc: string; icon: string }[] = [
  { id: 'none', title: 'Bodyweight Only', desc: 'No equipment (Calisthenics & Mat)', icon: '🤸' },
  { id: 'basic', title: 'Basic Home Setup', desc: 'Dumbbells, resistance bands, pull-up bar', icon: '🏠' },
  { id: 'full_gym', title: 'Full Commercial Gym', desc: 'Barbells, cables, racks, machines', icon: '🏋️' },
];
const INJURY_OPTIONS: { id: InjuryTag; label: string; area: string }[] = [
  { id: 'knee', label: 'Knee Joint / ACL / Meniscus', area: 'Lower Body' },
  { id: 'shoulder', label: 'Shoulder / Rotator Cuff', area: 'Upper Body' },
  { id: 'back', label: 'Lower / Mid Back (Lumbar)', area: 'Spine & Core' },
  { id: 'wrist', label: 'Wrist / Carpal Tunnel', area: 'Arm & Grip' },
  { id: 'ankle', label: 'Ankle / Achilles Tendon', area: 'Lower Body' },
  { id: 'neck', label: 'Neck / Cervical Spine', area: 'Upper Body' },
  { id: 'elbow', label: 'Elbow / Tendinitis', area: 'Arm' },
  { id: 'hip', label: 'Hip / Femoroacetabular', area: 'Pelvis' },
];
const DIETARY_PREFS = ['No Preference', 'Vegetarian', 'Vegan', 'High Protein', 'Keto / Low Carb', 'Gluten Free'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Information
  const [name, setName] = useState(user?.displayName ?? '');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Step 2: Body & Fitness
  const [activityLevel, setActivityLevel] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Step 3: Lifestyle & Location
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [preferredSessionDuration, setPreferredSessionDuration] = useState<number>(45);
  const [equipmentAccess, setEquipmentAccess] = useState<EquipmentAccess>('full_gym');
  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation>('commercial_gym');

  // Step 4: Health & Safety
  const [selectedInjuryTags, setSelectedInjuryTags] = useState<InjuryTag[]>([]);
  const [injuryNotes, setInjuryNotes] = useState('');
  const [physicalRestrictions, setPhysicalRestrictions] = useState('');
  const [relevantHealthConditions, setRelevantHealthConditions] = useState('');

  // Step 5: Goals & Preferences
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [dietaryPref, setDietaryPref] = useState('No Preference');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  // Load existing draft or profile
  useEffect(() => {
    if (!user) return;

    const draftKey = `fluetas_onboarding_draft_${user.uid}`;
    const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.name) setName(d.name);
        if (d.dob) setDob(d.dob);
        if (d.gender) setGender(d.gender);
        if (d.heightCm) setHeightCm(d.heightCm);
        if (d.weightKg) setWeightKg(d.weightKg);
        if (d.bloodGroup) setBloodGroup(d.bloodGroup);
        if (d.activityLevel) setActivityLevel(d.activityLevel);
        if (d.fitnessLevel) setFitnessLevel(d.fitnessLevel);
        if (d.experienceLevel) setExperienceLevel(d.experienceLevel);
        if (d.daysPerWeek) setDaysPerWeek(d.daysPerWeek);
        if (d.preferredSessionDuration) setPreferredSessionDuration(d.preferredSessionDuration);
        if (d.equipmentAccess) setEquipmentAccess(d.equipmentAccess);
        if (d.workoutLocation) setWorkoutLocation(d.workoutLocation);
        if (d.selectedInjuryTags) setSelectedInjuryTags(d.selectedInjuryTags);
        if (d.injuryNotes) setInjuryNotes(d.injuryNotes);
        if (d.physicalRestrictions) setPhysicalRestrictions(d.physicalRestrictions);
        if (d.relevantHealthConditions) setRelevantHealthConditions(d.relevantHealthConditions);
        if (d.primaryGoal) setPrimaryGoal(d.primaryGoal);
        if (d.dietaryPref) setDietaryPref(d.dietaryPref);
        if (d.allergies) setAllergies(d.allergies);
        if (d.medications) setMedications(d.medications);
        if (d.emergencyName) setEmergencyName(d.emergencyName);
        if (d.emergencyPhone) setEmergencyPhone(d.emergencyPhone);
        if (d.emergencyRel) setEmergencyRel(d.emergencyRel);
        if (d.step) setStep(d.step);
      } catch {}
    }
  }, [user]);

  // Persist draft on changes
  const saveDraft = (nextStep?: number) => {
    if (!user) return;
    const draftKey = `fluetas_onboarding_draft_${user.uid}`;
    const payload = {
      name, dob, gender, heightCm, weightKg, bloodGroup,
      activityLevel, fitnessLevel, experienceLevel,
      daysPerWeek, preferredSessionDuration, equipmentAccess, workoutLocation,
      selectedInjuryTags, injuryNotes, physicalRestrictions, relevantHealthConditions,
      primaryGoal, dietaryPref, allergies, medications,
      emergencyName, emergencyPhone, emergencyRel,
      step: nextStep || step,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(payload));
    } catch {}
  };

  const toggleInjury = (tag: InjuryTag) => {
    setSelectedInjuryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Step Validations
  const validateCurrentStep = (): string | null => {
    if (step === 1) {
      if (!name.trim()) return 'Please enter your full name.';
      if (!dob) return 'Please enter your date of birth.';
      const dobDate = new Date(dob);
      const age = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (isNaN(dobDate.getTime()) || age < 13 || age > 120) return 'Please enter a valid date of birth (minimum age: 13).';
      if (!gender) return 'Please select your biological gender.';
      const h = Number(heightCm);
      if (!heightCm || isNaN(h) || h < 100 || h > 260) return 'Please enter a valid height in cm (100–260).';
      const w = Number(weightKg);
      if (!weightKg || isNaN(w) || w < 30 || w > 350) return 'Please enter a valid weight in kg (30–350).';
    }
    if (step === 2) {
      if (!activityLevel) return 'Please select your daily activity level.';
      if (!fitnessLevel) return 'Please select your current fitness level.';
      if (!experienceLevel) return 'Please select your training experience level.';
    }
    if (step === 3) {
      if (!daysPerWeek || daysPerWeek < 2 || daysPerWeek > 6) return 'Please choose a weekly workout frequency (2–6 days).';
      if (!preferredSessionDuration || preferredSessionDuration < 20) return 'Please choose your preferred session duration.';
      if (!equipmentAccess) return 'Please select your available equipment.';
      if (!workoutLocation) return 'Please select your primary workout location.';
    }
    if (step === 4) {
      // Safety step is valid even with no injuries selected
    }
    if (step === 5) {
      if (!primaryGoal) return 'Please select your primary wellness & training goal.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Profile Completeness Preview
  const tempProfile = {
    name, dob, gender,
    heightCm: Number(heightCm) || null,
    weightKg: Number(weightKg) || null,
    bloodGroup: bloodGroup || null,
  };
  const tempHealth = {
    primaryGoal, fitnessGoal: primaryGoal,
    fitnessLevel, experienceLevel, activityLevel,
    daysPerWeek, preferredSessionDuration,
    equipmentAccess, equipment: equipmentAccess,
    workoutLocation,
    injuryTags: selectedInjuryTags,
    physicalRestrictions: physicalRestrictions.trim() ? [physicalRestrictions.trim()] : [],
    dietaryPreference: dietaryPref,
  };
  const completeness = calculateProfileCompleteness(tempProfile, tempHealth);

  const handleComplete = async () => {
    if (!user || !db) return;
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = serverTimestamp();

      // 1. Save /users/{uid} authoritative profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email || '',
        dob,
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        bloodGroup: bloodGroup || null,
        role: 'customer',
        premiumMember: false,
        onboardingComplete: true,
        updatedAt: now,
      }, { merge: true });

      // 2. Save /users/{uid}/healthProfile/main
      await setDoc(doc(db, 'users', user.uid, 'healthProfile', 'main'), {
        primaryGoal,
        fitnessGoal: primaryGoal,
        fitnessLevel,
        experienceLevel,
        activityLevel,
        daysPerWeek,
        preferredSessionDuration,
        equipmentAccess,
        equipment: equipmentAccess,
        workoutLocation,
        injuryTags: selectedInjuryTags,
        injuries: selectedInjuryTags,
        injuryNotes: injuryNotes.trim(),
        physicalRestrictions: physicalRestrictions.trim() ? [physicalRestrictions.trim()] : [],
        relevantHealthConditions: relevantHealthConditions.trim() ? [relevantHealthConditions.trim()] : [],
        dietaryPreference: dietaryPref,
        sleepTargetHrs: 8,
        hydrationTargetL: 2.5,
        allergies: allergies.trim() ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        currentMedications: medications.trim() ? medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: emergencyName.trim()
          ? { name: emergencyName.trim(), phone: emergencyPhone.trim(), relationship: emergencyRel.trim() }
          : null,
        onboardingCompletedAt: now,
        updatedAt: now,
      }, { merge: true });

      // 3. Record timeline event
      await addTimelineEvent(user.uid, {
        type: 'profile_created',
        title: 'Health & Fitness Profile Activated',
        description: `Baseline established for ${primaryGoal} · ${daysPerWeek}-day frequency.`,
        category: 'Wellness',
        badge: 'Active',
      });

      // 4. Clear local draft
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`fluetas_onboarding_draft_${user.uid}`);
      }

      // 5. Navigate to customer dashboard
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('[Onboarding] Submit Error:', err);
      setError(err?.message || 'Failed to complete profile activation.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full flex flex-col gap-5 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 text-xs font-bold mb-2">
            <Sparkles size={13} />
            <span>FLUETAS SENSOR &amp; HEALTH ONBOARDING</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#12160F] m-0">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-xs sm:text-sm text-[#586151] m-0 mt-0.5">
            {STEPS[step - 1].subtitle} · Step {step} of {STEPS.length}
          </p>
        </div>

        {/* Stepper Bar & Progress Indicator */}
        <div className="fluetas-card p-3 sm:p-4 bg-white border border-[rgba(18,22,15,0.08)]">
          <div className="flex items-center justify-between gap-1 mb-2">
            {STEPS.map(s => {
              const isDone = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                      isDone
                        ? 'bg-[#2E7D32]'
                        : isCurrent
                        ? 'bg-[#12160F]'
                        : 'bg-[#F2F4EE]'
                    }`}
                  />
                  <span className={`text-[0.6rem] font-bold hidden sm:block ${
                    isCurrent ? 'text-[#12160F]' : isDone ? 'text-[#2E7D32]' : 'text-[#8A9482]'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[0.68rem] text-[#586151] pt-1">
            <span>Profile Completeness: <strong className="text-[#12160F]">{completeness.pct}%</strong></span>
            <span>{completeness.remaining.length} fields remaining</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2 animate-slide-up">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="fluetas-card p-5 sm:p-7 bg-white border border-[rgba(18,22,15,0.08)] shadow-sm">
          {/* ── STEP 1: Basic Information ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Biological Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="260"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    placeholder="175"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="350"
                    step="0.1"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    placeholder="72.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Blood Group (Optional)</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                  >
                    <option value="">Select (Optional)</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Body & Fitness ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-2">Daily Activity Level *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACTIVITY_LEVELS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivityLevel(item.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        activityLevel === item.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#12160F] m-0">{item.label}</p>
                      <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Current Fitness Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FITNESS_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFitnessLevel(lvl)}
                      className={`p-3 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        fitnessLevel === lvl
                          ? 'border-[#12160F] bg-[#12160F] text-white shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#12160F] hover:bg-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Resistance Training Experience *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXPERIENCE_LEVELS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExperienceLevel(item.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        experienceLevel === item.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#12160F] m-0">{item.label}</p>
                      <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Lifestyle & Location ───────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-2">Weekly Workout Frequency *</label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysPerWeek(days)}
                      className={`p-3 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        daysPerWeek === days
                          ? 'border-[#2E7D32] bg-[#2E7D32] text-white shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#12160F] hover:bg-white'
                      }`}
                    >
                      <span className="text-base block">{days}</span>
                      <span className="text-[0.6rem] font-normal block opacity-85">days/wk</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Preferred Session Duration *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setPreferredSessionDuration(mins)}
                      className={`p-3 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        preferredSessionDuration === mins
                          ? 'border-[#12160F] bg-[#12160F] text-white shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#12160F] hover:bg-white'
                      }`}
                    >
                      <span className="text-sm block">{mins}</span>
                      <span className="text-[0.6rem] font-normal block opacity-85">minutes</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Available Equipment *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {EQUIPMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEquipmentAccess(opt.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        equipmentAccess === opt.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <span className="text-xl block mb-1">{opt.icon}</span>
                      <p className="font-bold text-xs text-[#12160F] m-0">{opt.title}</p>
                      <p className="text-[0.65rem] text-[#586151] m-0 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Primary Workout Location *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WORKOUT_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setWorkoutLocation(loc.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        workoutLocation === loc.id
                          ? 'border-[#2E6DA4] bg-[#2E6DA4]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#12160F] m-0">{loc.icon} {loc.label}</p>
                      <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">{loc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Health & Safety ────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[#12160F] font-bold">Injury Screening &amp; Joint Sensitivity</label>
                  <span className="text-[0.65rem] text-[#586151]">Select all that apply</span>
                </div>
                <p className="text-[0.7rem] text-[#586151] mb-2.5 m-0">
                  FLUETAS engine will automatically exclude contraindicated exercises and substitute safe variations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INJURY_OPTIONS.map(opt => {
                    const isSelected = selectedInjuryTags.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInjury(opt.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-[#12160F]'
                            : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#586151] hover:border-[rgba(18,22,15,0.20)]'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-[#12160F] m-0">{opt.label}</p>
                          <p className="text-[0.62rem] text-[#586151] m-0">{opt.area}</p>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[0.65rem] font-bold ${
                          isSelected ? 'bg-amber-500 text-white border-amber-500' : 'border-[rgba(18,22,15,0.20)]'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-1">Physical Restrictions / Orthopedic Notes (Optional)</label>
                <input
                  type="text"
                  value={physicalRestrictions}
                  onChange={e => setPhysicalRestrictions(e.target.value)}
                  placeholder="e.g. No heavy overhead pressing, avoid deep squats"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-1">Relevant Health Conditions (Optional)</label>
                <input
                  type="text"
                  value={relevantHealthConditions}
                  onChange={e => setRelevantHealthConditions(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension, Herniated disc"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs outline-none focus:border-[#2E7D32]"
                />
              </div>
            </div>
          )}

          {/* ── STEP 5: Goals & Preferences ────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-2">Primary Fitness &amp; Health Goal *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        primaryGoal === g.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#12160F] m-0">{g.label}</p>
                      <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-2">Dietary Preference *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIETARY_PREFS.map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setDietaryPref(pref)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        dietaryPref === pref
                          ? 'border-[#12160F] bg-[#12160F] text-white shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] text-[#12160F] hover:bg-white'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Allergies (Optional)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Penicillin, Shellfish"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Medications (Optional)</label>
                  <input
                    type="text"
                    value={medications}
                    onChange={e => setMedications(e.target.value)}
                    placeholder="e.g. Levothyroxine, Inhaler"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.08)] space-y-2">
                <span className="font-bold text-[#12160F] text-xs block">Emergency Contact (Optional)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={e => setEmergencyName(e.target.value)}
                    placeholder="Contact Name"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(18,22,15,0.10)] text-[#12160F] text-xs outline-none"
                  />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(18,22,15,0.10)] text-[#12160F] text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={emergencyRel}
                    onChange={e => setEmergencyRel(e.target.value)}
                    placeholder="Relationship"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(18,22,15,0.10)] text-[#12160F] text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: Review & Confirm ───────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2E7D32] text-sm m-0">Profile Complete &amp; Ready for Activation</h4>
                  <p className="text-[0.72rem] text-[#586151] m-0 mt-0.5">
                    Your personal workout engine and telemetry dashboards will calibrate to these inputs.
                  </p>
                </div>
                <span className="font-['Outfit'] text-2xl font-black text-[#2E7D32]">{completeness.pct}%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-1.5">
                  <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block">Biometrics &amp; Identity</span>
                  <p className="text-[#12160F] m-0 font-bold">{name} ({gender})</p>
                  <p className="text-[#586151] m-0">DOB: {dob} · {heightCm} cm · {weightKg} kg</p>
                  {bloodGroup && <p className="text-[#586151] m-0">Blood Group: {bloodGroup}</p>}
                </div>

                <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-1.5">
                  <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block">Training Prescription</span>
                  <p className="text-[#12160F] m-0 font-bold">{primaryGoal.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-[#586151] m-0">{daysPerWeek} Days/Week · {preferredSessionDuration} Mins/Session</p>
                  <p className="text-[#586151] m-0">Apparatus: {equipmentAccess.toUpperCase()} ({workoutLocation})</p>
                </div>

                <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-1.5">
                  <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block">Safety &amp; Injury Exclusions</span>
                  <p className="text-[#12160F] m-0">
                    {selectedInjuryTags.length > 0 ? selectedInjuryTags.join(', ') : 'None Reported'}
                  </p>
                  {physicalRestrictions && <p className="text-[#586151] m-0">Notes: {physicalRestrictions}</p>}
                </div>

                <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)] space-y-1.5">
                  <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block">Nutrition &amp; Lifestyle</span>
                  <p className="text-[#12160F] m-0">{dietaryPref}</p>
                  <p className="text-[#586151] m-0">Activity: {activityLevel.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[rgba(18,22,15,0.08)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#12160F] hover:bg-[#25201A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Activating Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Activate Profile &amp; Unlock Engine</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
