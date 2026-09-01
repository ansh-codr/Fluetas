'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getPatientAuthorizedHealthData,
  AuthorizedPatientData,
  createTestRequest,
  createRecommendation,
  createFollowUp,
} from '@/lib/services/doctorService';
import {
  Stethoscope,
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Activity,
  Heart,
  Pill,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';

export default function PatientChartPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const patientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<AuthorizedPatientData | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Workspace State
  const [activeTab, setActiveTab] = useState<'overview' | 'workspace' | 'timeline'>('overview');

  // Consultation Form State
  const [observations, setObservations] = useState('');
  const [assessment, setAssessment] = useState('');
  const [advice, setAdvice] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>(['Perform gentle rotator cuff external rotations daily (2 sets x 15 reps).']);
  const [newRec, setNewRec] = useState('');

  // Test Request Sub-form
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testName, setTestName] = useState('Comprehensive Metabolic Panel (CMP)');
  const [testReason, setTestReason] = useState('Evaluate baseline biomarkers');
  const [testPriority, setTestPriority] = useState<'Routine' | 'Urgent' | 'Stat'>('Routine');

  // Follow-up Sub-form
  const [followUpDate, setFollowUpDate] = useState('2026-09-10');
  const [followUpPurpose, setFollowUpPurpose] = useState('Reassess range of motion and review ordered diagnostic labs.');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const doctorId = user?.uid || 'dr_rajesh_sharma';
  const doctorName = user?.displayName || 'Dr. Rajesh Sharma, MD';

  useEffect(() => {
    if (!patientId) return;

    getPatientAuthorizedHealthData(doctorId, patientId)
      .then(res => {
        if (!res.authorized) {
          // If demo patient, supply sample authorized data for testing
          if (patientId.startsWith('patient_demo')) {
            setPatientData({
              relationship: {
                relationshipId: 'rel_demo',
                doctorId,
                customerId: patientId,
                customerName: patientId.includes('priya') ? 'Priya Sharma' : 'Rahul Mehta',
                consentId: 'consent_demo',
                status: 'active',
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
              },
              userProfile: {
                uid: patientId,
                email: patientId.includes('priya') ? 'priya@example.com' : 'rahul@example.com',
                name: patientId.includes('priya') ? 'Priya Sharma' : 'Rahul Mehta',
                dob: '1996-04-12',
                gender: patientId.includes('priya') ? 'Female' : 'Male',
                heightCm: 178,
                weightKg: 76,
                bloodGroup: 'O+',
                role: 'customer',
                premiumMember: true,
                onboardingComplete: true,
              },
              healthProfile: {
                fitnessLevel: 'Intermediate',
                activityLevel: 'Active (4-5 days/week)',
                dietaryPreference: 'High Protein',
                allergies: ['Penicillin', 'Peanuts (Mild)'],
                chronicConditions: ['Mild Rotator Cuff Impingement'],
                currentMedications: ['Vitamin D3 60,000 IU', 'Whey Isolate'],
                primaryGoal: 'Muscle Hypertrophy & Joint Longevity',
              },
              symptoms: [
                { id: 's1', userId: patientId, timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 } as any, date: '2 days ago', symptom: 'Right shoulder pinch at 90 deg abduction', category: 'Musculoskeletal', severity: 'Moderate' },
                { id: 's2', userId: patientId, timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 } as any, date: '1 week ago', symptom: 'Post-workout upper trapezius stiffness', category: 'Musculoskeletal', severity: 'Mild' },
              ],
              permissions: {
                health_profile: true,
                medical_history: true,
                medications: true,
                allergies: true,
                consultations: true,
                reports: true,
                workout_data: true,
                nutrition_data: true,
                sleep_data: true,
                HER_data: false,
              },
              unauthorizedScopes: [],
            });
          } else {
            setAuthError(res.reason || 'Access not authorized by patient consent');
          }
        } else {
          setPatientData(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        setAuthError('Failed to verify clinical relationship');
        setLoading(false);
      });
  }, [doctorId, patientId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddRecommendation = () => {
    if (newRec.trim()) {
      setRecommendations([...recommendations, newRec.trim()]);
      setNewRec('');
    }
  };

  const handleRemoveRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const handleOrderTest = async () => {
    if (!patientId || !testName.trim()) return;
    try {
      await createTestRequest({
        doctorId,
        doctorName,
        customerId: patientId,
        customerName: patientData?.userProfile?.name,
        testName,
        reason: testReason,
        priority: testPriority,
      });
      setTestModalOpen(false);
      showToast(`Diagnostic test ordered: ${testName}`);
    } catch (err) {
      alert('Failed to order test');
    }
  };

  const handleSubmitConsultation = async () => {
    if (!patientId) return;
    setSubmitting(true);
    try {
      // 1. Create recommendations
      if (recommendations.length > 0) {
        await createRecommendation({
          doctorId,
          doctorName,
          customerId: patientId,
          content: recommendations,
        });
      }

      // 2. Schedule follow-up
      if (followUpDate) {
        await createFollowUp({
          doctorId,
          doctorName,
          customerId: patientId,
          customerName: patientData?.userProfile?.name,
          date: followUpDate,
          purpose: followUpPurpose,
        });
      }

      showToast('Consultation notes & recommendations submitted successfully!');
      setTimeout(() => {
        setActiveTab('overview');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to submit consultation record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
        <div className="h-28 bg-[#13161F] rounded-2xl animate-pulse" />
        <div className="h-64 bg-[#13161F] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // 403 / Revoked Consent Screen
  if (authError || !patientData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <span className="px-2.5 py-0.5 rounded text-[0.65rem] font-bold bg-amber-500/15 text-amber-400 mb-2">
          Consent Gated
        </span>
        <h2 className="font-['Outfit'] text-xl font-bold text-[#E8EAF6] m-0">
          Access Not Authorized
        </h2>
        <p className="text-xs text-[#8B91B0] m-0 mt-2 leading-relaxed">
          {authError || 'Access to this patient’s health record is not currently authorized or was revoked by the patient.'}
        </p>
        <Link
          href="/doctor/patients"
          className="btn-primary mt-4 flex items-center gap-2 text-xs font-bold px-4 py-2 no-underline"
        >
          <ArrowLeft size={14} /> Back to Authorized Patients
        </Link>
      </div>
    );
  }

  const { userProfile, healthProfile, symptoms, permissions, unauthorizedScopes } = patientData;
  const patientName = userProfile?.name || 'Patient';

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Back Link */}
      <Link
        href="/doctor/patients"
        className="flex items-center gap-1.5 text-xs text-[#8B91B0] hover:text-[#E8EAF6] no-underline w-fit"
      >
        <ArrowLeft size={14} /> Back to Patients List
      </Link>

      {/* Patient Header Card */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#0E2433] to-[#0A1A24] border-[#38BDF8]/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-extrabold flex items-center justify-center text-2xl shadow-lg shrink-0">
              {patientName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Outfit'] text-lg sm:text-2xl font-black text-[#E8EAF6] m-0">
                  {patientName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Active Consent Verified
                </span>
              </div>
              <p className="text-xs text-[#8B91B0] m-0 mt-1">
                {userProfile?.gender || 'Gender N/A'} · Blood Group: <strong className="text-[#38BDF8]">{userProfile?.bloodGroup || 'O+'}</strong> · Height: {userProfile?.heightCm || 178}cm · Weight: {userProfile?.weightKg || 76}kg
              </p>
              <p className="text-[0.68rem] text-[#10B981] font-semibold m-0 mt-0.5">
                Primary Goal: {healthProfile?.primaryGoal || 'Longevity & Performance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setActiveTab('workspace')}
              className="btn-primary bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer"
            >
              <Stethoscope size={14} /> Start Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#1E2133] gap-2">
        {[
          { id: 'overview', label: 'Consented Health Profile', icon: Activity },
          { id: 'workspace', label: 'Consultation Workspace & Directives', icon: Stethoscope },
          { id: 'timeline', label: 'Patient Health Timeline', icon: Calendar },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'text-[#38BDF8] border-[#38BDF8]'
                  : 'text-[#8B91B0] border-transparent hover:text-[#E8EAF6]'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CONSENTED HEALTH PROFILE ── */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4">
          {/* AI Patient Summary Card (§23) */}
          <div className="fluetas-card p-4 sm:p-5 bg-gradient-to-br from-[#13161F] to-[#1A102E] border-[#A78BFA]/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#A78BFA]" />
              <span className="section-title text-[#A78BFA]">AI CLINICAL RECORD SUMMARY (AUTOMATED)</span>
            </div>
            <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed">
              Patient has completed 2 previous consultations with FLUETAS physiotherapists. Most recent reports indicate mild right shoulder impingement during overhead barbell press. Patient has active daily hydration logging compliance and no contraindicating medications.
            </p>
            <p className="text-[0.62rem] text-[#8B91B0] m-0 mt-2 italic">
              Note: AI summary aggregates recorded historical logs only. No automatic diagnoses are generated.
            </p>
          </div>

          {/* Clinical Vitals Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Allergies */}
            <div className="fluetas-card p-4">
              <span className="text-[0.68rem] font-bold text-[#F87171] uppercase tracking-wider block mb-2">
                Allergies &amp; Sensitivities
              </span>
              {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {healthProfile.allergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F87171]/15 text-[#F87171] text-xs font-semibold border border-[#F87171]/30">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8B91B0] m-0">No allergies recorded.</p>
              )}
            </div>

            {/* Current Medications */}
            <div className="fluetas-card p-4">
              <span className="text-[0.68rem] font-bold text-[#38BDF8] uppercase tracking-wider block mb-2">
                Current Medications &amp; Supplements
              </span>
              {healthProfile?.currentMedications && healthProfile.currentMedications.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {healthProfile.currentMedications.map((m, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[#0B0D14] border border-[#1E2133] text-xs text-[#E8EAF6] flex items-center gap-2">
                      <Pill size={12} className="text-[#38BDF8]" />
                      <span>{typeof m === 'string' ? m : (m as any).name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8B91B0] m-0">No active medications recorded.</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="fluetas-card p-4">
              <span className="text-[0.68rem] font-bold text-[#FBBF24] uppercase tracking-wider block mb-2">
                Chronic Conditions / Phenotypes
              </span>
              {healthProfile?.chronicConditions && healthProfile.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {healthProfile.chronicConditions.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#FBBF24]/15 text-[#FBBF24] text-xs font-semibold border border-[#FBBF24]/30">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8B91B0] m-0">None reported.</p>
              )}
            </div>
          </div>

          {/* Recent Symptoms Stream */}
          <div className="fluetas-card p-5">
            <span className="section-title mb-3 block">RECENT PATIENT-REPORTED SYMPTOMS</span>
            <div className="flex flex-col gap-2.5">
              {symptoms.map(sym => (
                <div key={sym.id} className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 text-[#FB923C] flex items-center justify-center">
                      <Activity size={16} />
                    </div>
                    <div>
                      <strong className="text-[#E8EAF6] block">{sym.symptom}</strong>
                      <span className="text-[0.68rem] text-[#8B91B0]">Category: {sym.category} · {sym.date}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#FB923C]/15 text-[#FB923C]">
                    {sym.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CONSULTATION WORKSPACE (§15) ── */}
      {activeTab === 'workspace' && (
        <div className="flex flex-col gap-5 animate-slide-up">
          {/* Clinical Notes Inputs */}
          <div className="fluetas-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2133]">
              <div>
                <span className="section-title">ACTIVE CONSULTATION WORKSPACE</span>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  Enter examination observations, clinical assessments, and post-session directives.
                </p>
              </div>

              <button
                onClick={() => setTestModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] hover:bg-[#FBBF24]/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={13} /> Request Lab / Scan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">
                  Clinical Examination &amp; Symptoms Noted
                </label>
                <textarea
                  rows={4}
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Document physical findings, range of motion tests, palpation pain, etc..."
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-3 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">
                  Clinical Assessment &amp; Diagnosis
                </label>
                <textarea
                  rows={4}
                  value={assessment}
                  onChange={e => setAssessment(e.target.value)}
                  placeholder="Clinical assessment, differential diagnosis, recovery stage..."
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-3 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8B91B0] font-semibold mb-1">
                Advice &amp; Lifestyle Guidance
              </label>
              <textarea
                rows={3}
                value={advice}
                onChange={e => setAdvice(e.target.value)}
                placeholder="Prescribed lifestyle adjustments, sleep position modifications, hydration pacing..."
                className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-3 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>
          </div>

          {/* Actionable Recommendations List (§20) */}
          <div className="fluetas-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="section-title">PRESCRIBED RECOMMENDATIONS (IMMUTABLE HISTORY)</span>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D14] border border-[#1E2133] text-xs text-[#E8EAF6]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span>{rec}</span>
                  </div>
                  <button onClick={() => handleRemoveRecommendation(i)} className="text-red-400 hover:opacity-70 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newRec}
                onChange={e => setNewRec(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRecommendation(); } }}
                placeholder="Add actionable health recommendation directive..."
                className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-xs text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
              />
              <button
                onClick={handleAddRecommendation}
                className="px-4 py-2 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-bold cursor-pointer hover:bg-[#38BDF8]/25 transition-all"
              >
                Add Directive
              </button>
            </div>
          </div>

          {/* Follow-up Scheduler (§21) */}
          <div className="fluetas-card p-5">
            <span className="section-title mb-3 block">SCHEDULE CLINICAL FOLLOW-UP</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Follow-up Clinical Objective</label>
                <input
                  value={followUpPurpose}
                  onChange={e => setFollowUpPurpose(e.target.value)}
                  placeholder="e.g. Range of motion assessment & lab review"
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSubmitConsultation}
              disabled={submitting}
              className="btn-primary bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-black font-bold text-xs px-6 py-3 shadow-[0_0_16px_rgba(56,189,248,0.3)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Generating Report...' : 'Finalize & Issue Consultation Report'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: HEALTH TIMELINE (§13) ── */}
      {activeTab === 'timeline' && (
        <div className="fluetas-card p-5">
          <span className="section-title mb-4 block">CHRONOLOGICAL PATIENT HEALTH TIMELINE</span>
          <div className="space-y-3 text-xs">
            {[
              { date: '28 Aug 2026', title: 'Diagnostic Lab Report Uploaded', desc: 'Comprehensive Metabolic Panel (CMP) uploaded by patient', color: '#FBBF24' },
              { date: '24 Aug 2026', title: 'Telehealth Consultation Completed', desc: 'Dr. Rajesh Sharma conducted initial shoulder assessment', color: '#10B981' },
              { date: '18 Aug 2026', title: 'Symptom Logged: Shoulder Pinch', desc: 'Moderate pain at 90 degree abduction', color: '#FB923C' },
              { date: '01 Aug 2026', title: 'Health Record Profile Initialized', desc: 'Biometric baseline created', color: '#38BDF8' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133] flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: t.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-[#E8EAF6]">{t.title}</strong>
                    <span className="text-[0.62rem] text-[#8B91B0]">{t.date}</span>
                  </div>
                  <p className="text-[#8B91B0] m-0 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Order Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-[#E8EAF6] mb-3 font-['Outfit'] flex items-center gap-2">
              <FileText size={16} className="text-[#FBBF24]" />
              Order Diagnostic Test / Report
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Test Name</label>
                <select
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#FBBF24] focus:outline-none"
                >
                  <option>Complete Blood Count (CBC)</option>
                  <option>Vitamin D (25-OH) Panel</option>
                  <option>Vitamin B12 &amp; Folate</option>
                  <option>HbA1c &amp; Fasting Glucose</option>
                  <option>Comprehensive Metabolic Panel (CMP)</option>
                  <option>3T MRI Right Shoulder</option>
                  <option>X-Ray Cervical Spine</option>
                  <option>Lipid Profile</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Clinical Indication / Reason</label>
                <input
                  value={testReason}
                  onChange={e => setTestReason(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#FBBF24] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Routine', 'Urgent', 'Stat'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTestPriority(p)}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        testPriority === p
                          ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#FBBF24]'
                          : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#1E2133] text-[#8B91B0] text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderTest}
                  className="btn-primary bg-[#FBBF24] text-black hover:bg-[#FBBF24]/90 px-4 py-2 text-xs font-bold"
                >
                  Issue Test Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
