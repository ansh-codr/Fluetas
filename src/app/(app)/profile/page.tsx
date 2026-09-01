'use client';

import React, { useState } from 'react';
import { mockUser, mockHealthProfile } from '@/lib/mock/dashboardData';
import { User, Heart, Shield, Award, Edit3, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'health' | 'lifestyle'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    name: mockUser.name,
    email: mockUser.email,
    dob: mockUser.dob,
    gender: mockUser.gender,
    height: mockUser.height,
    weight: mockUser.weight,
    bloodGroup: mockUser.bloodGroup,
    emergencyName: mockUser.emergencyContact.name,
    emergencyPhone: mockUser.emergencyContact.phone,
    emergencyRel: mockUser.emergencyContact.relationship,
  });

  const [allergies, setAllergies] = useState<string[]>(mockHealthProfile.allergies);
  const [newAllergy, setNewAllergy] = useState('');
  const [medications, setMedications] = useState(mockHealthProfile.currentMedications);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');

  const handleSave = () => {
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (newMedName.trim()) {
      setMedications([
        ...medications,
        { name: newMedName.trim(), dosage: newMedDose.trim() || 'Daily', prescribedBy: 'Self / Specialist' }
      ]);
      setNewMedName('');
      setNewMedDose('');
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          Profile changes saved successfully to Health Record!
        </div>
      )}

      {/* Profile Header Card */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] to-[#171B2A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#10B981]/15 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
              {basicInfo.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
                  {basicInfo.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1">
                  <Award size={12} />
                  Premium Member
                </span>
              </div>
              <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
                {basicInfo.email} · Member since Jan 2026
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#8B91B0]">
                <span>Blood: <strong className="text-[#E8EAF6]">{basicInfo.bloodGroup}</strong></span>
                <span>•</span>
                <span>Height: <strong className="text-[#E8EAF6]">{basicInfo.height}</strong></span>
                <span>•</span>
                <span>Weight: <strong className="text-[#E8EAF6]">{basicInfo.weight}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`btn-primary px-4 py-2 text-xs flex items-center gap-2 self-stretch sm:self-auto justify-center ${
              isEditing ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7]' : ''
            }`}
          >
            {isEditing ? (
              <>
                <Save size={14} />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 size={14} />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#1E2133] gap-2">
        {[
          { id: 'basic', label: 'Personal & Vitals', icon: User },
          { id: 'health', label: 'Medical & Allergies', icon: Heart },
          { id: 'lifestyle', label: 'Lifestyle & Routine', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[2px] cursor-pointer ${
                isActive
                  ? 'text-[#10B981] border-[#10B981]'
                  : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal & Vitals */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="fluetas-card p-5">
            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-4 uppercase tracking-wider text-[#10B981]">
              Basic Demographics
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    value={basicInfo.name}
                    onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                ) : (
                  <p className="font-semibold text-[#E8EAF6] m-0">{basicInfo.name}</p>
                )}
              </div>
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={basicInfo.dob}
                    onChange={e => setBasicInfo({ ...basicInfo, dob: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                ) : (
                  <p className="font-semibold text-[#E8EAF6] m-0">{basicInfo.dob} (Age 30)</p>
                )}
              </div>
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={basicInfo.gender}
                    onChange={e => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary / Other</option>
                  </select>
                ) : (
                  <p className="font-semibold text-[#E8EAF6] m-0">{basicInfo.gender}</p>
                )}
              </div>
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Blood Group</label>
                {isEditing ? (
                  <input
                    value={basicInfo.bloodGroup}
                    onChange={e => setBasicInfo({ ...basicInfo, bloodGroup: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                ) : (
                  <p className="font-semibold text-[#10B981] m-0">{basicInfo.bloodGroup}</p>
                )}
              </div>
            </div>
          </div>

          <div className="fluetas-card p-5">
            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-4 uppercase tracking-wider text-[#38BDF8]">
              Physical Parameters & Emergency
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Height</label>
                {isEditing ? (
                  <input
                    value={basicInfo.height}
                    onChange={e => setBasicInfo({ ...basicInfo, height: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                ) : (
                  <p className="font-semibold text-[#E8EAF6] m-0">{basicInfo.height}</p>
                )}
              </div>
              <div>
                <label className="text-[#8B91B0] font-medium block mb-1">Weight</label>
                {isEditing ? (
                  <input
                    value={basicInfo.weight}
                    onChange={e => setBasicInfo({ ...basicInfo, weight: e.target.value })}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                ) : (
                  <p className="font-semibold text-[#E8EAF6] m-0">{basicInfo.weight}</p>
                )}
              </div>
              <div className="col-span-2 pt-2 border-t border-[#1E2133]">
                <label className="text-[#8B91B0] font-medium block mb-1">Emergency Contact</label>
                <p className="font-semibold text-[#E8EAF6] m-0">
                  {basicInfo.emergencyName} ({basicInfo.emergencyRel}) · {basicInfo.emergencyPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medical & Allergies */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allergies */}
          <div className="fluetas-card p-5">
            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-3 uppercase tracking-wider text-[#F472B6]">
              Allergies & Sensitivities
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F472B6]/15 text-[#F472B6] border border-[#F472B6]/30 flex items-center gap-1.5"
                >
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => removeAllergy(i)}
                      className="hover:text-white cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-2">
                <input
                  placeholder="Add allergy (e.g. Sulfa drugs)..."
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-lg px-2.5 py-1.5 text-xs text-[#E8EAF6]"
                />
                <button
                  onClick={addAllergy}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div className="fluetas-card p-5">
            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-3 uppercase tracking-wider text-[#A78BFA]">
              Active Medications & Supplements
            </h3>
            <div className="flex flex-col gap-2 mb-3">
              {medications.map((med, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#1E2133] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#E8EAF6] m-0">{med.name}</p>
                    <p className="text-[#8B91B0] text-[0.68rem] m-0">{med.dosage} · {med.prescribedBy}</p>
                  </div>
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  placeholder="Medication name..."
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="bg-[#0B0D14] border border-[#1E2133] rounded-lg px-2.5 py-1.5 text-xs text-[#E8EAF6]"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Dosage (e.g. 500mg daily)..."
                    value={newMedDose}
                    onChange={e => setNewMedDose(e.target.value)}
                    className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-lg px-2.5 py-1.5 text-xs text-[#E8EAF6]"
                  />
                  <button
                    onClick={addMedication}
                    className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Surgeries & Injuries */}
          <div className="fluetas-card p-5 md:col-span-2">
            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-3 uppercase tracking-wider text-[#FB923C]">
              Past Surgeries & Musculoskeletal History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {mockHealthProfile.previousSurgeries.map((surg, idx) => (
                <div key={idx} className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-lg">
                  <span className="text-[0.65rem] font-bold text-[#FB923C] uppercase">Surgery</span>
                  <p className="font-bold text-[#E8EAF6] m-0 text-sm mt-0.5">{surg.procedure}</p>
                  <p className="text-[#8B91B0] m-0 text-xs mt-1">{surg.year} · {surg.hospital}</p>
                </div>
              ))}
              {mockHealthProfile.previousInjuries.map((inj, idx) => (
                <div key={idx} className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-lg">
                  <span className="text-[0.65rem] font-bold text-[#38BDF8] uppercase">Past Injury</span>
                  <p className="font-bold text-[#E8EAF6] m-0 text-sm mt-0.5">{inj.injury}</p>
                  <p className="text-[#8B91B0] m-0 text-xs mt-1">{inj.year} · {inj.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Lifestyle & Routine */}
      {activeTab === 'lifestyle' && (
        <div className="fluetas-card p-5">
          <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] mb-4 uppercase tracking-wider text-[#10B981]">
            Daily Habits & Lifestyle Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {Object.entries(mockHealthProfile.lifestyleInfo).map(([key, val]) => (
              <div key={key} className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-lg">
                <span className="text-[#8B91B0] capitalize block mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <p className="font-bold text-[#E8EAF6] m-0 text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
