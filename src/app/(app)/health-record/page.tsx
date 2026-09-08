'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { getUserConsultations, ConsultationData } from '@/lib/services/consultationService';
import { getPatientConsents, revokeConsent, ConsentRecord } from '@/lib/services/consentService';
import { updateUserProfile, updateHealthProfile } from '@/lib/services/userService';
import { exportHealthRecordPdf } from '@/lib/services/healthRecordPdf';
import {
  FileText,
  Heart,
  Stethoscope,
  Pill,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Pencil,
  X,
} from 'lucide-react';

export default function HealthRecordPage() {
  const { user } = useAuth();
  const { profile, healthProfile, refresh } = useUserProfile();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'consultations' | 'settings'>('overview');

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editGoal, setEditGoal] = useState('');
  const [editAllergies, setEditAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [consList, consentList] = await Promise.all([
        getUserConsultations(user.uid),
        getPatientConsents(user.uid),
      ]);
      setConsultations(consList);
      setConsents(consentList);
    } catch {}
  };

  useEffect(() => { loadData(); }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRevoke = async (consent: ConsentRecord) => {
    if (!user || !consent.consentId) return;
    try {
      await revokeConsent(user.uid, consent.consentId, consent.doctorName);
      showToast(`Revoked access for ${consent.doctorName}`);
      await loadData();
    } catch { alert('Failed to revoke'); }
  };

  const handleExportPdf = async () => {
    setDownloadingPdf(true);
    try {
      await exportHealthRecordPdf({ profile, healthProfile, consultations, consents, userEmail: user?.email || undefined });
      showToast('PDF downloaded!');
    } catch { alert('Failed to export.'); }
    finally { setDownloadingPdf(false); }
  };

  const openEditModal = () => {
    setEditName(profile?.name || user?.displayName || '');
    setEditDob(profile?.dob || '');
    setEditGender(profile?.gender || '');
    setEditBloodGroup(profile?.bloodGroup || 'O+');
    setEditGoal(healthProfile?.primaryGoal || '');
    setEditAllergies(healthProfile?.allergies || []);
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editName.trim()) { setEditError('Name required.'); return; }
    setSavingProfile(true);
    try {
      await Promise.all([
        updateUserProfile(user.uid, { name: editName.trim(), dob: editDob, gender: editGender, bloodGroup: editBloodGroup }),
        updateHealthProfile(user.uid, { primaryGoal: editGoal, allergies: editAllergies }),
      ]);
      await refresh();
      showToast('Profile updated!');
      setIsEditModalOpen(false);
    } catch (err: any) { setEditError(err.message || 'Save failed.'); }
    finally { setSavingProfile(false); }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">My Health Record</h1>
          <p className="text-[#586151] text-xs m-0 mt-0.5">Your personal health profile and consultation history.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            className="px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-xs font-bold text-[#586151] hover:bg-[#F2F4EE] flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> {downloadingPdf ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: Heart },
          { id: 'consultations', label: `Consultations (${consultations.length})`, icon: Stethoscope },
          { id: 'settings', label: 'Settings', icon: ShieldCheck },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-[#2E7D32] text-white'
                  : 'bg-white text-[#586151] border border-[rgba(18,22,15,0.10)] hover:text-[#12160F]'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-[rgba(18,22,15,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#12160F] m-0">Personal Info</h2>
              <button onClick={openEditModal} className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer flex items-center gap-1">
                <Pencil size={12} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#8A9482] block mb-0.5">Name</span>
                <p className="font-bold text-[#12160F] m-0">{profile?.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-[#8A9482] block mb-0.5">DOB</span>
                <p className="font-bold text-[#12160F] m-0">{profile?.dob || 'Not set'}</p>
              </div>
              <div>
                <span className="text-[#8A9482] block mb-0.5">Gender</span>
                <p className="font-bold text-[#12160F] m-0">{profile?.gender || 'Not set'}</p>
              </div>
              <div>
                <span className="text-[#8A9482] block mb-0.5">Blood</span>
                <p className="font-bold text-[#2E7D32] m-0">{profile?.bloodGroup || 'O+'}</p>
              </div>
            </div>
          </div>

          {/* Goal & Conditions */}
          <div className="bg-white p-5 rounded-2xl border border-[rgba(18,22,15,0.08)]">
            <h2 className="font-bold text-[#12160F] m-0 mb-3">Health Goals</h2>
            <p className="text-sm font-semibold text-[#2E7D32] m-0">{healthProfile?.primaryGoal || 'Not set'}</p>
            {healthProfile?.allergies && healthProfile.allergies.length > 0 && (
              <div className="mt-3">
                <span className="text-[0.68rem] font-bold text-[#C23B6B] block mb-1">Allergies</span>
                <div className="flex flex-wrap gap-1.5">
                  {healthProfile.allergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#C23B6B]/10 text-[#C23B6B] text-xs font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Doctor Access */}
          <div className="bg-white p-5 rounded-2xl border border-[rgba(18,22,15,0.08)]">
            <h2 className="font-bold text-[#12160F] m-0 mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#2E7D32]" /> Doctor Access
            </h2>
            {consents.length === 0 ? (
              <p className="text-xs text-[#586151] m-0">No doctors have access yet. Book a consultation to share your records.</p>
            ) : (
              <div className="space-y-2">
                {consents.map(c => (
                  <div key={c.consentId} className="flex items-center justify-between p-3 bg-[#F2F4EE] rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-[#12160F] m-0">{c.doctorName}</p>
                      <span className={`text-[0.6rem] font-bold ${c.status === 'active' ? 'text-[#2E7D32]' : 'text-red-500'}`}>
                        {c.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    {c.status === 'active' && (
                      <button onClick={() => handleRevoke(c)} className="text-xs text-red-500 hover:underline cursor-pointer">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consultations Tab */}
      {tab === 'consultations' && (
        <div className="space-y-3">
          {consultations.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-[rgba(18,22,15,0.08)] text-center">
              <Stethoscope size={24} className="text-[#2E7D32] mx-auto mb-2" />
              <p className="font-bold text-[#12160F] m-0">No consultations yet</p>
              <p className="text-xs text-[#586151] m-0 mt-1">Your consultation history will appear here.</p>
            </div>
          ) : (
            consultations.map(cons => (
              <div key={cons.id} className="bg-white p-4 rounded-2xl border border-[rgba(18,22,15,0.08)]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-[#12160F] m-0">{cons.expertName}</p>
                    <p className="text-xs text-[#586151] m-0">{cons.specialization}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
                    {cons.status}
                  </span>
                </div>
                <p className="text-xs text-[#586151] m-0 flex items-center gap-1">
                  <Clock size={11} /> {cons.preferredDate || 'Date TBC'}
                </p>
                <p className="text-xs text-[#12160F] m-0 mt-2 p-2 bg-[#F2F4EE] rounded-lg">
                  {cons.reason}
                </p>
                {cons.clinicalNotes && (
                  <div className="mt-2 p-3 bg-[#F2F4EE] rounded-lg text-xs space-y-1">
                    <p className="m-0"><strong className="text-[#2E6DA4]">Notes:</strong> {cons.clinicalNotes}</p>
                    {cons.advice && <p className="m-0"><strong className="text-[#D97706]">Advice:</strong> {cons.advice}</p>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="bg-white p-5 rounded-2xl border border-[rgba(18,22,15,0.08)]">
          <h2 className="font-bold text-[#12160F] m-0 mb-4">Health Settings</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#F2F4EE] rounded-xl">
              <span className="text-[#12160F] font-semibold">Medications</span>
              <span className="text-[#586151]">
                {healthProfile?.currentMedications?.length || 0} recorded
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F2F4EE] rounded-xl">
              <span className="text-[#12160F] font-semibold">Sleep Target</span>
              <span className="text-[#586151]">{healthProfile?.sleepTargetHrs || 8} hrs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F2F4EE] rounded-xl">
              <span className="text-[#12160F] font-semibold">Hydration Target</span>
              <span className="text-[#586151]">{healthProfile?.hydrationTargetL || 2.5} L</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#12160F] m-0">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="cursor-pointer p-1"><X size={18} className="text-[#586151]" /></button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-3">{editError}</div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none focus:border-[#2E7D32]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">DOB</label>
                  <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none focus:border-[#2E7D32]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Gender</label>
                  <select value={editGender} onChange={e => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none focus:border-[#2E7D32]">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Non-Binary</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Blood Group</label>
                  <select value={editBloodGroup} onChange={e => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none focus:border-[#2E7D32]">
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Goal</label>
                  <input type="text" value={editGoal} onChange={e => setEditGoal(e.target.value)} placeholder="e.g. Build Muscle"
                    className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none focus:border-[#2E7D32]" />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="font-bold block mb-1">Allergies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editAllergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#C23B6B]/10 text-[#C23B6B] text-xs font-semibold flex items-center gap-1">
                      {a}
                      <button type="button" onClick={() => setEditAllergies(editAllergies.filter((_, idx) => idx !== i))} className="hover:text-red-700 cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Add allergy..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[rgba(18,22,15,0.12)] outline-none text-xs" />
                  <button type="button" onClick={() => { if (newAllergy.trim()) { setEditAllergies([...editAllergies, newAllergy.trim()]); setNewAllergy(''); } }}
                    className="px-3 py-1.5 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold cursor-pointer">Add</button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
