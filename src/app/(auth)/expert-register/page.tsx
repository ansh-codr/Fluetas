'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerExpertAccount } from '@/lib/firebase/auth';
import {
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  Building,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Account', icon: User },
  { id: 2, title: 'Credentials', icon: Stethoscope },
  { id: 3, title: 'Documents', icon: Upload },
  { id: 4, title: 'Consultation', icon: FileText },
  { id: 5, title: 'Availability', icon: Calendar },
  { id: 6, title: 'Consent', icon: ShieldCheck },
  { id: 7, title: 'Submit', icon: CheckCircle2 },
];

const ROLES = [
  { id: 'DOCTOR', title: 'Medical Doctor / Physician', desc: 'MBBS/MD Clinical consultations and medical diagnostics' },
  { id: 'GYNECOLOGIST', title: 'Gynecologist & Women\'s Health', desc: 'Endocrine, cycle, postpartum, and pelvic health' },
  { id: 'PHYSIOTHERAPIST', title: 'Physiotherapist & Rehab', desc: 'Musculoskeletal rehab, injury management, biomechanics' },
  { id: 'NUTRITIONIST', title: 'Clinical Nutritionist & Dietitian', desc: 'Metabolic health, meal architecture, sports dietetics' },
  { id: 'TRAINER', title: 'Certified Strength & Conditioning', desc: 'Athletic performance, functional strength programming' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 — Professional Info
  const [professionalRole, setProfessionalRole] = useState('DOCTOR');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationAuthority, setRegistrationAuthority] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  // Step 3 — Documents
  const [docNames, setDocNames] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Step 4 — Consultation Profile (NO fees in MVP)
  const [consultationType, setConsultationType] = useState('1-on-1 Encrypted Telehealth');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [languages, setLanguages] = useState('English, Hindi');

  // Step 5 — Availability
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakPeriods, setBreakPeriods] = useState('13:00 - 14:00 Lunch');

  // Step 6 — Consent
  const [consentAudit, setConsentAudit] = useState(false);
  const [consentEthics, setConsentEthics] = useState(false);
  const [consentDataSecurity, setConsentDataSecurity] = useState(false);

  const toggleDay = (d: string) => {
    setSelectedDays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));
  };

  const handleDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadProgress(true);
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setTimeout(() => {
        setDocNames(prev => [...prev, ...newFiles]);
        setUploadProgress(false);
      }, 500);
    }
  };

  const validateCurrentStep = () => {
    setError('');
    if (step === 1) {
      if (!name.trim()) return 'Please enter your full legal name.';
      if (!email.trim() || !email.includes('@')) return 'Please enter a valid professional email.';
      if (!phone.trim()) return 'Please enter your contact phone number.';
      if (password.length < 6) return 'Password must be at least 6 characters long.';
    } else if (step === 2) {
      if (!specialization.trim()) return 'Please enter your clinical or training specialization.';
      if (!qualification.trim()) return 'Please state your qualifications (e.g. MBBS, DNB, MPT, CSCS).';
      if (!registrationNumber.trim()) return 'Please provide your medical/practitioner registration number.';
      if (!registrationAuthority.trim()) return 'Please specify the licensing authority (e.g. State Medical Council).';
      if (!experience.trim()) return 'Please state your years of clinical/coaching experience.';
      if (!bio.trim() || bio.length < 20) return 'Please write a brief professional bio (min 20 characters).';
    } else if (step === 5) {
      if (selectedDays.length === 0) return 'Please select at least one active working day.';
    } else if (step === 6) {
      if (!consentAudit || !consentEthics || !consentDataSecurity) {
        return 'You must accept all regulatory and ethics terms to submit your application.';
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await registerExpertAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        professionalRole,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        registrationNumber: registrationNumber.trim(),
        registrationAuthority: registrationAuthority.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        consultationType,
        durationMinutes,
        workingDays: selectedDays,
        workingHours: { start: startTime, end: endTime },
        breakPeriods,
        documentNames: docNames,
      });

      setSubmitted(true);
    } catch (submitErr: any) {
      console.error('[ExpertRegister] Registration failed:', submitErr);
      setError(submitErr.message || 'Registration failed. Email may already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAF6]">
        <div className="max-w-lg w-full fluetas-card p-8 text-center bg-white border border-[rgba(18,22,15,0.10)] shadow-lg rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="font-['Outfit'] text-2xl font-black text-[#12160F] m-0">
            Application Submitted
          </h2>

          <p className="text-sm text-[#586151] mt-2 mb-6 leading-relaxed">
            Thank you, <span className="font-bold text-[#12160F]">{name}</span>. Your clinical credentials and documents have been securely transmitted to the FLUETAS Medical &amp; Governance Board.
          </p>

          <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] text-left mb-6 text-xs text-[#586151] space-y-1.5">
            <p className="m-0 font-bold text-[#12160F]">Verification Process:</p>
            <p className="m-0">• Application Status: <span className="font-semibold text-[#D97706]">PENDING REVIEW</span></p>
            <p className="m-0">• Medical Council Registry Verification: <span className="font-semibold text-[#2E6DA4]">IN PROGRESS</span></p>
            <p className="m-0">• Estimated turnaround: 24–48 hours</p>
          </div>

          <Link
            href="/login"
            className="btn-primary inline-flex items-center justify-center w-full py-2.5 text-xs font-bold no-underline"
          >
            Go to Practitioner Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#FAFAF6] flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 no-underline">
            <img src="/assets/image.png" alt="FLUETAS" className="w-9 h-9 object-contain" />
            <span className="font-['Outfit'] text-2xl font-black text-[#12160F]">FLUETAS</span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold mb-2">
              <Stethoscope size={13} /> EXPERT &amp; CLINICAL NETWORK
            </div>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-[#12160F] m-0">
            Practitioner Registration
          </h1>
          <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1">
            Join vetted doctors, physiotherapists, dietitians, and coaches on our clinical platform.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between mb-6 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-[rgba(18,22,15,0.08)] shadow-xs overflow-x-auto no-scrollbar">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-[#2E7D32] text-white'
                    : isDone
                    ? 'text-[#2E7D32] bg-[#2E7D32]/10'
                    : 'text-[#8A9482]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="fluetas-card p-6 sm:p-8 bg-white border border-[rgba(18,22,15,0.10)] shadow-md rounded-2xl">
          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 1: Account Information</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Your official practitioner login credentials.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Full Legal Name (with prefix)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rohan Verma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Professional Email</label>
                    <input
                      type="email"
                      placeholder="rohan.verma@hospital.org"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Create Secure Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Professional Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 2: Professional Information</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Select your role and licensing registry.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-2">Professional Designation</label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setProfessionalRole(r.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        professionalRole === r.id
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.10)] hover:border-[rgba(18,22,15,0.20)]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#12160F] m-0">{r.title}</p>
                      <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Clinical Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Sports Physio &amp; Spine Rehab"
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Degree &amp; Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD (Sports Med), MPT"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Registration Number</label>
                  <input
                    type="text"
                    placeholder="MCI-88921"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Registration Authority</label>
                  <input
                    type="text"
                    placeholder="Delhi Medical Council"
                    value={registrationAuthority}
                    onChange={e => setRegistrationAuthority(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Experience (Years)</label>
                  <input
                    type="text"
                    placeholder="8+ years"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Professional Bio &amp; Approach</label>
                <textarea
                  rows={3}
                  placeholder="Describe your clinical focus, background with athletes, and evidence-based methodologies..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 3: Verification Documents</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Upload medical certificates and identity proof for administrative audit.</p>
              </div>

              <div className="border-2 border-dashed border-[rgba(18,22,15,0.18)] rounded-2xl p-6 text-center bg-[#FAFAF6] hover:bg-[#F2F4EE] transition-colors">
                <Upload size={28} className="mx-auto text-[#2E7D32] mb-2" />
                <p className="text-xs font-bold text-[#12160F] m-0">Upload Verification Records</p>
                <p className="text-[0.6875rem] text-[#586151] m-0 mt-1 max-w-sm mx-auto">
                  PDF or image files of your Medical License, Degree Certificates, and Government ID.
                </p>
                <input
                  type="file"
                  multiple
                  id="doc-upload"
                  onChange={handleDocumentFile}
                  className="hidden"
                />
                <label
                  htmlFor="doc-upload"
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 mt-4 text-xs font-bold cursor-pointer"
                >
                  Select Files
                </label>
              </div>

              {uploadProgress && (
                <div className="flex items-center gap-2 text-xs text-[#2E7D32] font-semibold">
                  <Loader2 size={14} className="animate-spin" /> Uploading documents...
                </div>
              )}

              {docNames.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#12160F]">Attached Documents ({docNames.length}):</span>
                  {docNames.map((fn, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-[#FAFAF6] rounded-xl text-xs border border-[rgba(18,22,15,0.06)]">
                      <span className="font-medium text-[#12160F] truncate">{fn}</span>
                      <span className="text-[0.6875rem] font-bold text-[#2E7D32]">Ready</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Consultation Profile (NO fees) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 4: Consultation Profile</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Format and communication preferences.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Consultation Medium</label>
                  <select
                    value={consultationType}
                    onChange={e => setConsultationType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  >
                    <option>1-on-1 Encrypted Telehealth</option>
                    <option>In-Clinic Clinical Session</option>
                    <option>Hybrid Telehealth &amp; Physical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Slot Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  >
                    <option value={20}>20 Minutes (Follow-up)</option>
                    <option value={30}>30 Minutes (Standard)</option>
                    <option value={45}>45 Minutes (Comprehensive)</option>
                    <option value={60}>60 Minutes (Initial Assessment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Spoken Languages</label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, Punjabi"
                  value={languages}
                  onChange={e => setLanguages(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 5: Schedule &amp; Availability</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Define your regular operating hours for appointments.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1.5">Active Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedDays.includes(d)
                          ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                          : 'bg-[#FAFAF6] text-[#586151] border-[rgba(18,22,15,0.12)]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Daily Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12160F] mb-1">Daily End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Break Periods / Exceptions</label>
                <input
                  type="text"
                  placeholder="e.g. 13:00 - 14:00 Lunch Break"
                  value={breakPeriods}
                  onChange={e => setBreakPeriods(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Consent & Ethics */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 6: Clinical Governance &amp; Declarations</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Compliance with telehealth regulations and medical confidentiality.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAudit}
                    onChange={e => setConsentAudit(e.target.checked)}
                    className="mt-0.5 accent-[#2E7D32]"
                  />
                  <span className="text-xs text-[#12160F]">
                    <strong className="block">Licensure &amp; Clinical Standing</strong>
                    I certify that I hold an active, valid license from the stated medical/coaching authority and have no active disciplinary actions.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentEthics}
                    onChange={e => setConsentEthics(e.target.checked)}
                    className="mt-0.5 accent-[#2E7D32]"
                  />
                  <span className="text-xs text-[#12160F]">
                    <strong className="block">Telemedicine Guidelines</strong>
                    I agree to abide by statutory Telemedicine Practice Guidelines, ensuring accurate patient consent before reviewing health telemetry.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-[#FAFAF6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentDataSecurity}
                    onChange={e => setConsentDataSecurity(e.target.checked)}
                    className="mt-0.5 accent-[#2E7D32]"
                  />
                  <span className="text-xs text-[#12160F]">
                    <strong className="block">Data Security &amp; Audit Trail</strong>
                    I understand that all clinical record accesses on FLUETAS are logged in immutable audit trails.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: Application Review */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Step 7: Application Summary</h3>
                <p className="text-xs text-[#586151] m-0 mt-0.5">Verify your details before final submission.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[rgba(18,22,15,0.06)]">
                  <span className="text-[#586151]">Practitioner Name:</span>
                  <span className="font-bold text-[#12160F]">{name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(18,22,15,0.06)]">
                  <span className="text-[#586151]">Professional Role:</span>
                  <span className="font-bold text-[#12160F]">{professionalRole}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(18,22,15,0.06)]">
                  <span className="text-[#586151]">Specialization:</span>
                  <span className="font-bold text-[#12160F]">{specialization}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(18,22,15,0.06)]">
                  <span className="text-[#586151]">Registration:</span>
                  <span className="font-bold text-[#12160F]">{registrationNumber} ({registrationAuthority})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(18,22,15,0.06)]">
                  <span className="text-[#586151]">Schedule:</span>
                  <span className="font-bold text-[#12160F]">{selectedDays.join(', ')} ({startTime} - {endTime})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#586151]">Initial Status:</span>
                  <span className="font-bold text-[#D97706]">PENDING ADMINISTRATIVE VERIFICATION</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[rgba(18,22,15,0.08)] mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-1 text-xs font-bold text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <Link href="/login" className="text-xs font-bold text-[#586151] hover:underline no-underline">
                Already registered? Sign In
              </Link>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-1.5 px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Submit Application
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
