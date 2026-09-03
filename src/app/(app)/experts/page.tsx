'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockDoctorsList } from '@/lib/mock/dashboardData';
import { bookConsultation } from '@/lib/services/consultationService';
import {
  Stethoscope,
  Star,
  Clock,
  Lock,
  CheckCircle2,
  X,
  Filter,
  Loader2,
} from 'lucide-react';

type ConsentScopes = Record<string, boolean>;

export default function ExpertsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctorsList[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'consent' | 'confirmed'>('details');
  const [submitting, setSubmitting] = useState(false);

  // Booking Form State
  const [reason, setReason] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [consentScopes, setConsentScopes] = useState<ConsentScopes>({
    healthHistory: true,
    previousConsultations: true,
    relevantReports: true,
    currentMedications: true,
    workoutHistory: true,
    nutritionLogs: false,
  });

  const specializations = ['All', 'Sports Physio & Rehab', 'Metabolic Endocrinology', 'Performance Nutrition', 'Gastroenterology', 'Sleep Medicine'];

  const filteredDoctors = filter === 'All'
    ? mockDoctorsList
    : mockDoctorsList.filter(d => d.specialization.toLowerCase().includes(filter.toLowerCase()));

  const handleOpenBooking = (doctor: typeof mockDoctorsList[0]) => {
    setSelectedDoctor(doctor);
    setBookingStep('details');
    setReason('');
    setSymptomsInput('');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedDoctor) return;
    setSubmitting(true);
    try {
      const symptoms = symptomsInput.split(',').map(s => s.trim()).filter(Boolean);
      await bookConsultation(user.uid, {
        expertId: selectedDoctor.id,
        expertName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        reason: reason.trim(),
        symptomsReported: symptoms,
        preferredDate: selectedDoctor.nextSlot,
        consentScopes,
      });

      setBookingStep('confirmed');
      setTimeout(() => {
        setSelectedDoctor(null);
        router.push('/consultations');
      }, 1800);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={20} className="text-[#2E7D32]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              VERIFIED DOCTORS &amp; SPECIALISTS
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Book 1-on-1 encrypted video consultations with vetted clinical experts.
          </p>
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#F2F4EE] p-1 rounded-xl border border-[rgba(18,22,15,0.10)] overflow-x-auto self-start sm:self-auto no-scrollbar">
          <Filter size={13} className="text-[#586151] ml-1.5 shrink-0 hidden xs:block" />
          {specializations.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer ${
                filter === s
                  ? 'bg-[#2E7D32] text-white font-bold shadow-sm'
                  : 'text-[#586151] hover:text-[#12160F]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="fluetas-card p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div>
              {/* Doctor Header */}
              <div className="flex items-start gap-3.5 mb-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: doc.avatarColor || '#2E7D32' }}
                >
                  {doc.avatarInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0 truncate">
                      {doc.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#D97706] shrink-0">
                      <Star size={13} fill="#D97706" />
                      {doc.rating} ({doc.reviews})
                    </span>
                  </div>

                  <p className="text-xs text-[#2E7D32] font-semibold m-0 mt-0.5 truncate">
                    {doc.specialization}
                  </p>
                  <p className="text-[0.68rem] text-[#586151] m-0 truncate">
                    {doc.credentials} · {doc.experience}
                  </p>
                </div>
              </div>

              {/* Bio & Hospital */}
              <p className="text-xs text-[#586151] m-0 leading-relaxed line-clamp-2 bg-[#F2F4EE] p-2.5 rounded-lg border border-[rgba(18,22,15,0.06)]">
                {doc.bio}
              </p>
            </div>

            {/* Footer / Slots & Action */}
            <div className="pt-3 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between gap-3">
              <div>
                <span className="text-[0.65rem] text-[#586151] block">Next Available Slot</span>
                <span className="text-xs font-bold text-[#2E6DA4] flex items-center gap-1">
                  <Clock size={12} />
                  {doc.nextSlot}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#12160F] hidden sm:block">
                  {doc.fee}
                </span>
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="btn-primary py-1.5 px-4 text-xs font-bold shrink-0 cursor-pointer shadow-sm"
                >
                  Book &amp; Grant Consent
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Consent & Booking Flow Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[rgba(18,22,15,0.12)] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 text-[#586151] hover:text-[#12160F]"
            >
              <X size={18} />
            </button>

            {bookingStep === 'details' ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope size={18} className="text-[#2E7D32]" />
                  <h3 className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">
                    Schedule Consultation
                  </h3>
                </div>
                <p className="text-xs text-[#586151] m-0 mb-4">
                  Consultation with <strong className="text-[#12160F]">{selectedDoctor.name}</strong> ({selectedDoctor.specialization}).
                </p>

                <div className="flex flex-col gap-3 text-xs mb-4">
                  <div>
                    <label className="block text-[#586151] font-semibold mb-1">
                      Reason for Consultation *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Describe what you want to address (e.g. rotator cuff discomfort during bench press, knee pain, post-workout fatigue)..."
                      className="w-full bg-white border border-[rgba(18,22,15,0.15)] rounded-xl p-2.5 text-[#12160F] focus:border-[#2E7D32] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#586151] font-semibold mb-1">
                      Related Symptoms (comma separated)
                    </label>
                    <input
                      value={symptomsInput}
                      onChange={e => setSymptomsInput(e.target.value)}
                      placeholder="e.g. Shoulder impingement, Mild clicking, Morning stiffness"
                      className="w-full bg-white border border-[rgba(18,22,15,0.15)] rounded-xl p-2.5 text-[#12160F] focus:border-[#2E7D32] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.10)] text-[#586151] text-xs font-semibold hover:text-[#12160F]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingStep('consent')}
                    disabled={!reason.trim()}
                    className="btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    Proceed to Consent Scope →
                  </button>
                </div>
              </div>
            ) : bookingStep === 'consent' ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-[#2E7D32]" />
                  <h3 className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">
                    Consent &amp; Granular Data Access Scopes
                  </h3>
                </div>
                <p className="text-xs text-[#586151] m-0 mb-4 leading-relaxed">
                  Select the specific data domains you authorize <strong className="text-[#12160F]">{selectedDoctor.name}</strong> to access during consultation:
                </p>

                {/* Scope Checkboxes */}
                <div className="space-y-2.5 mb-5 text-xs">
                  {[
                    { key: 'healthHistory', label: 'Complete Medical & Surgical History', desc: 'Allergies, past surgeries, chronic conditions' },
                    { key: 'previousConsultations', label: 'Past Consultation Notes & Reports', desc: 'Clinical notes from other specialists' },
                    { key: 'relevantReports', label: 'Diagnostic Lab Reports & Scans', desc: 'Blood panels, metabolic reports' },
                    { key: 'currentMedications', label: 'Current Medication Regimen', desc: 'Prescription doses & supplements' },
                    { key: 'workoutHistory', label: 'Training Volume & Exercise Logs', desc: 'Biomechanical loading history' },
                    { key: 'nutritionLogs', label: 'Daily Nutrition & Macro Intake', desc: 'Calorie pacing and meal logs' },
                  ].map(scope => {
                    const checked = (consentScopes as any)[scope.key];
                    return (
                      <label
                        key={scope.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          checked
                            ? 'bg-[#2E7D32]/10 border-[#2E7D32]/30 text-[#12160F]'
                            : 'bg-[#F2F4EE] border-[rgba(18,22,15,0.06)] text-[#586151]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => setConsentScopes({ ...consentScopes, [scope.key]: e.target.checked })}
                          className="mt-0.5 accent-[#2E7D32]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs m-0">{scope.label}</p>
                          <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">{scope.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="bg-[#F2F4EE] p-3 rounded-xl border border-[rgba(18,22,15,0.06)] flex items-center justify-between mb-4 text-xs">
                  <div>
                    <span className="text-[#586151] block">Slot Selected:</span>
                    <strong className="text-[#2E6DA4]">{selectedDoctor.nextSlot}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#586151] block">Consultation Fee:</span>
                    <strong className="text-[#2E7D32]">{selectedDoctor.fee}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBookingStep('details')}
                    className="px-4 py-2.5 rounded-xl border border-[rgba(18,22,15,0.10)] text-[#586151] text-xs font-semibold hover:text-[#12160F]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="btn-primary flex-1 py-3 justify-center font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {submitting ? 'Confirming & Saving...' : 'Confirm Booking & Grant Consent'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#2E7D32]/20 text-[#2E7D32] flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">
                  Consultation Confirmed!
                </h3>
                <p className="text-xs text-[#586151] m-0 mt-1 max-w-sm mx-auto">
                  Your appointment with {selectedDoctor.name} has been persisted to your consultations record and timeline. Redirecting to your consultations...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
