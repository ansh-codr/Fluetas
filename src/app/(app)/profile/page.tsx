'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, updateHealthProfile } from '@/lib/services/userService';
import { User, Heart, Shield, Edit3, Save, Plus, Trash2, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const DIETARY_PREFS = ['No Preference', 'Vegetarian', 'Vegan', 'High Protein', 'Keto / Low Carb', 'Gluten Free'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];
const ACTIVITY_LEVELS = ['Sedentary (desk job)', 'Lightly active (1-2x/week)', 'Moderately active (3-4x/week)', 'Active (5+x/week)'];

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, healthProfile, completeness, loading: profileLoading, refresh } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'basic' | 'health' | 'lifestyle'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [error, setError] = useState('');

  // Form state — seeded from real profile
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [newMed, setNewMed] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [dietaryPref, setDietaryPref] = useState('');
  const [sleepTarget, setSleepTarget] = useState('8');
  const [hydrationTarget, setHydrationTarget] = useState('2.5');

  // Seed form from real data
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setDob(profile.dob ?? '');
      setGender(profile.gender ?? '');
      setHeightCm(profile.heightCm?.toString() ?? '');
      setWeightKg(profile.weightKg?.toString() ?? '');
      setBloodGroup(profile.bloodGroup ?? '');
      setEmergencyName(healthProfile?.emergencyContact?.name ?? '');
      setEmergencyPhone(healthProfile?.emergencyContact?.phone ?? '');
      setEmergencyRel(healthProfile?.emergencyContact?.relationship ?? '');
    }
    if (healthProfile) {
      setAllergies(healthProfile.allergies ?? []);
      setConditions(healthProfile.chronicConditions ?? []);
      setMedications(healthProfile.currentMedications ?? []);
      setFitnessLevel(healthProfile.fitnessLevel ?? '');
      setActivityLevel(healthProfile.activityLevel ?? '');
      setDietaryPref(healthProfile.dietaryPreference ?? '');
      setSleepTarget(healthProfile.sleepTargetHrs?.toString() ?? '8');
      setHydrationTarget(healthProfile.hydrationTargetL?.toString() ?? '2.5');
    }
  }, [profile, healthProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await updateUserProfile(user.uid, {
        name: name.trim(),
        dob,
        gender,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        bloodGroup: bloodGroup || null,
      });

      await updateHealthProfile(user.uid, {
        fitnessLevel,
        activityLevel,
        dietaryPreference: dietaryPref,
        sleepTargetHrs: Number(sleepTarget) || 8,
        hydrationTargetL: Number(hydrationTarget) || 2.5,
        allergies,
        chronicConditions: conditions,
        currentMedications: medications,
        emergencyContact: emergencyName.trim()
          ? { name: emergencyName.trim(), phone: emergencyPhone.trim(), relationship: emergencyRel.trim() }
          : null,
      });

      await refresh();
      setIsEditing(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = name || profile?.name || user?.displayName || 'User';
  const firstName = displayName.split(' ')[0];

  if (profileLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
        <div className="h-32 bg-[#13161F] rounded-2xl animate-pulse" />
        <div className="h-12 bg-[#13161F] rounded-2xl animate-pulse" />
        <div className="h-64 bg-[#13161F] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          Profile saved successfully!
        </div>
      )}

      {/* Profile Header */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] to-[#171B2A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#10B981]/15 to-transparent rounded-full pointer-events-none blur-2xl" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-['Outfit'] text-lg sm:text-2xl font-black text-[#E8EAF6] m-0">
                  {displayName}
                </h1>
                {profile?.premiumMember && (
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
                    ⭐ Premium
                  </span>
                )}
              </div>
              <p className="text-[#8B91B0] text-xs m-0 mt-0.5">{user?.email}</p>
              <p className="text-[#10B981] text-[0.65rem] font-semibold m-0 mt-1">
                {healthProfile?.primaryGoal ?? 'Goal not set'} · {profile?.gender ?? 'Gender not set'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Profile Completeness */}
            <div className="min-w-[160px]">
              <div className="flex items-center justify-between text-[0.65rem] mb-1">
                <span className="text-[#8B91B0]">Profile Completeness</span>
                <span className="font-bold" style={{ color: completeness.pct >= 70 ? '#10B981' : completeness.pct >= 40 ? '#FBBF24' : '#FB923C' }}>
                  {completeness.pct}%
                </span>
              </div>
              <ProgressBar value={completeness.pct} color={completeness.pct >= 70 ? '#10B981' : completeness.pct >= 40 ? '#FBBF24' : '#FB923C'} height={5} />
              {completeness.remaining.length > 0 && (
                <p className="text-[0.6rem] text-[#3A3F58] mt-1">Missing: {completeness.remaining.slice(0, 2).join(', ')}{completeness.remaining.length > 2 ? `...` : ''}</p>
              )}
            </div>

            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : isEditing ? <Save size={13} /> : <Edit3 size={13} />}
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">{error}</div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : '—', color: '#10B981' },
          { label: 'Weight', value: profile?.weightKg ? `${profile.weightKg} kg` : '—', color: '#38BDF8' },
          { label: 'Blood Group', value: profile?.bloodGroup || '—', color: '#F472B6' },
          { label: 'Fitness Level', value: healthProfile?.fitnessLevel || '—', color: '#FBBF24' },
        ].map(stat => (
          <div key={stat.label} className="fluetas-card p-3.5 text-center">
            <p className="font-['Outfit'] text-base font-black m-0" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E2133] gap-2">
        {[
          { id: 'basic', label: 'Basic Info', icon: User },
          { id: 'health', label: 'Health Details', icon: Heart },
          { id: 'lifestyle', label: 'Lifestyle Goals', icon: Shield },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
                activeTab === t.id ? 'text-[#10B981] border-[#10B981]' : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── BASIC INFO TAB ── */}
      {activeTab === 'basic' && (
        <div className="fluetas-card p-5 flex flex-col gap-4">
          <span className="section-title">BASIC INFORMATION</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Full Name', value: name, setter: setName, placeholder: 'Your full name', type: 'text' },
              { label: 'Email Address', value: user?.email ?? '', setter: () => {}, placeholder: '', type: 'email', readonly: true },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[#8B91B0] font-medium mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => !f.readonly && f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  disabled={!isEditing || f.readonly}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
                />
                {f.readonly && <p className="text-[0.6rem] text-[#3A3F58] mt-1">Email is set by your authentication provider.</p>}
              </div>
            ))}

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
              >
                <option value="">Select...</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Height (cm)</label>
              <input
                type="number" min={50} max={300}
                value={heightCm}
                onChange={e => setHeightCm(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. 175"
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Weight (kg)</label>
              <input
                type="number" min={20} max={500}
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. 70"
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
              >
                <option value="">Unknown</option>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-[#1E2133]">
            <p className="section-title mb-3">EMERGENCY CONTACT</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Name', value: emergencyName, setter: setEmergencyName, placeholder: 'Full name' },
                { label: 'Phone', value: emergencyPhone, setter: setEmergencyPhone, placeholder: 'Phone number' },
                { label: 'Relationship', value: emergencyRel, setter: setEmergencyRel, placeholder: 'e.g. Spouse' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[#8B91B0] font-medium mb-1.5">{f.label}</label>
                  <input
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    disabled={!isEditing}
                    placeholder={f.placeholder}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEALTH DETAILS TAB ── */}
      {activeTab === 'health' && (
        <div className="flex flex-col gap-4">
          {/* Allergies */}
          <div className="fluetas-card p-5">
            <p className="section-title mb-3">ALLERGIES</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {allergies.length === 0 && <p className="text-[#3A3F58] text-xs">No allergies recorded.</p>}
              {allergies.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-xs font-semibold">
                  {a}
                  {isEditing && (
                    <button onClick={() => setAllergies(allergies.filter((_, j) => j !== i))} className="hover:opacity-70 cursor-pointer">
                      <Trash2 size={11} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newAllergy.trim()) { setAllergies([...allergies, newAllergy.trim()]); setNewAllergy(''); } } }}
                  placeholder="Add allergy..."
                  className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-xs text-[#E8EAF6] focus:border-[#10B981] focus:outline-none"
                />
                <button
                  onClick={() => { if (newAllergy.trim()) { setAllergies([...allergies, newAllergy.trim()]); setNewAllergy(''); } }}
                  className="px-3 py-2 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold cursor-pointer hover:opacity-90 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="fluetas-card p-5">
            <p className="section-title mb-3">CHRONIC CONDITIONS</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {conditions.length === 0 && <p className="text-[#3A3F58] text-xs">No conditions recorded.</p>}
              {conditions.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold">
                  {c}
                  {isEditing && (
                    <button onClick={() => setConditions(conditions.filter((_, j) => j !== i))} className="hover:opacity-70 cursor-pointer">
                      <Trash2 size={11} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newCondition.trim()) { setConditions([...conditions, newCondition.trim()]); setNewCondition(''); } } }}
                  placeholder="Add condition..."
                  className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-xs text-[#E8EAF6] focus:border-[#10B981] focus:outline-none"
                />
                <button
                  onClick={() => { if (newCondition.trim()) { setConditions([...conditions, newCondition.trim()]); setNewCondition(''); } }}
                  className="px-3 py-2 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold cursor-pointer hover:opacity-90 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="fluetas-card p-5">
            <p className="section-title mb-3">CURRENT MEDICATIONS</p>
            <div className="flex flex-col gap-2 mb-3">
              {medications.length === 0 && <p className="text-[#3A3F58] text-xs">No medications recorded.</p>}
              {medications.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D14] border border-[#1E2133]">
                  <span className="text-xs text-[#E8EAF6] font-semibold">{typeof m === 'string' ? m : (m as { name: string }).name}</span>
                  {isEditing && (
                    <button onClick={() => setMedications(medications.filter((_, j) => j !== i))} className="text-[#F87171] hover:opacity-70 cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  value={newMed}
                  onChange={e => setNewMed(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newMed.trim()) { setMedications([...medications, newMed.trim()]); setNewMed(''); } } }}
                  placeholder="e.g. Vitamin D 2000IU"
                  className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-xs text-[#E8EAF6] focus:border-[#10B981] focus:outline-none"
                />
                <button
                  onClick={() => { if (newMed.trim()) { setMedications([...medications, newMed.trim()]); setNewMed(''); } }}
                  className="px-3 py-2 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold cursor-pointer hover:opacity-90 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIFESTYLE GOALS TAB ── */}
      {activeTab === 'lifestyle' && (
        <div className="fluetas-card p-5 flex flex-col gap-4">
          <span className="section-title">LIFESTYLE &amp; WELLNESS GOALS</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#8B91B0] font-medium mb-2">Fitness Level</label>
              <div className="grid grid-cols-2 gap-2">
                {FITNESS_LEVELS.map(f => (
                  <button key={f} type="button" onClick={() => isEditing && setFitnessLevel(f)}
                    disabled={!isEditing}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:cursor-default ${fitnessLevel === f ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]' : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0]'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-1.5">Activity Level</label>
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} disabled={!isEditing}
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors">
                <option value="">Select...</option>
                {ACTIVITY_LEVELS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#8B91B0] font-medium mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_PREFS.map(d => (
                  <button key={d} type="button" onClick={() => isEditing && setDietaryPref(d)}
                    disabled={!isEditing}
                    className={`p-2 rounded-lg text-[0.7rem] font-semibold border transition-all cursor-pointer disabled:cursor-default ${dietaryPref === d ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]' : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0]'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Sleep Target (hrs/night)</label>
                <input type="number" min={4} max={12} step={0.5} value={sleepTarget} onChange={e => setSleepTarget(e.target.value)} disabled={!isEditing}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[#8B91B0] font-medium mb-1.5">Hydration Target (L/day)</label>
                <input type="number" min={1} max={6} step={0.5} value={hydrationTarget} onChange={e => setHydrationTarget(e.target.value)} disabled={!isEditing}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] disabled:opacity-60 disabled:cursor-default focus:border-[#10B981] focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Footer (visible when editing) */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-[#13161F] border border-[#10B981]/40 rounded-2xl shadow-2xl z-40 animate-slide-up">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-[#8B91B0] text-xs font-semibold border border-[#1E2133] hover:text-white cursor-pointer transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
