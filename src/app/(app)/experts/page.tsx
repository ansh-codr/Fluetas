'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getVerifiedExperts, VerifiedExpert } from '@/lib/services/doctorService';
import { bookConsultation } from '@/lib/services/consultationService';
import {
  Stethoscope,
  Clock,
  Lock,
  CheckCircle2,
  X,
  Filter,
  Loader2,
  Calendar,
  UserCheck,
  ShieldCheck,
  Globe,
  Award,
} from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

type ConsentScopes = Record<string, boolean>;

export default function ExpertsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<VerifiedExpert | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'consent' | 'confirmed'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
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

  const specializations = [
    'All',
    "Women's Health",
    'Physician',
    'Nutrition',
    'Endocrinology',
    'Biochemistry',
    'Physio',
    'Conditioning',
  ];

  useEffect(() => {
    // Set default tomorrow date for booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);

    getVerifiedExperts()
      .then(res => {
        setExperts(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredDoctors = filter === 'All'
    ? experts
    : experts.filter(d =>
        d.specialization.toLowerCase().includes(filter.toLowerCase()) ||
        d.professionalRole.toLowerCase().includes(filter.toLowerCase()) ||
        d.focusAreas?.some(f => f.toLowerCase().includes(filter.toLowerCase()))
      );

  const handleOpenBooking = (doctor: VerifiedExpert) => {
    setSelectedDoctor(doctor);
    setBookingStep('details');
    setReason('');
    setSymptomsInput('');
    setBookingError('');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedDoctor) return;
    if (!reason.trim()) {
      setBookingError('Please enter a reason or primary health goal for this consultation.');
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      const symptoms = symptomsInput.split(',').map(s => s.trim()).filter(Boolean);
      await bookConsultation(user.uid, {
        expertId: selectedDoctor.id,
        expertName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        reason: reason.trim(),
        symptomsReported: symptoms,
        preferredDate: `${selectedDate} at ${selectedTime}`,
        consentScopes,
      });

      setBookingStep('confirmed');
      setTimeout(() => {
        setSelectedDoctor(null);
        router.push('/consultations');
      }, 1600);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setBookingError(err.message || 'Failed to book consultation. Please try again.');
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
              VERIFIED PRACTITIONERS &amp; SPECIALISTS
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Book 1-on-1 encrypted clinical telehealth and rehab consultations with board-verified experts.
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
                  ? 'bg-[#2E7D32] text-white font-bold shadow-xs'
                  : 'text-[#586151] hover:text-[#12160F]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Practitioner Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="fluetas-card p-10 flex flex-col items-center justify-center text-center bg-white border border-[rgba(18,22,15,0.10)] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
            <Stethoscope size={28} />
          </div>
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#2E7D32]/10 px-2.5 py-0.5 rounded-full mb-2">
            EXPERT CONSULTATIONS
          </span>
          <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
            Doctors and wellness experts are coming soon.
          </h3>
          <p className="text-xs text-[#586151] max-w-md mt-1.5 mb-5 leading-relaxed">
            Verified FLUETAS experts will appear here as they become available. Check back soon.
          </p>
          <Link
            href="/expert-register"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold no-underline shadow-xs"
          >
            <Award size={14} /> Are you a practitioner? Apply to Join
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="fluetas-card p-5 flex flex-col justify-between gap-4 bg-white border border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.20)] hover:shadow-md transition-all rounded-2xl"
            >
              <div>
                {/* Doctor Header */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: doc.avatarColor || '#2E7D32' }}
                  >
                    {doc.avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0 truncate">
                        {doc.name}
                      </h3>
                      <span className="flex items-center gap-1 text-[0.6875rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full border border-[#2E7D32]/20 shrink-0">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>

                    <p className="text-[#2E7D32] text-xs font-semibold m-0 mt-0.5">
                      {doc.specialization}
                    </p>

                    <p className="text-[#8A9482] text-[0.6875rem] m-0 mt-0.5">
                      {doc.qualification} · {doc.experience} Experience
                    </p>
                    {doc.affiliation && (
                      <p className="text-[#586151] text-[0.6875rem] font-medium m-0 mt-0.5">
                        {doc.affiliation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio snippet */}
                {doc.bio && (
                  <p className="text-xs text-[#586151] m-0 leading-relaxed line-clamp-2 mb-3">
                    {doc.bio}
                  </p>
                )}

                {/* Focus Areas Chips */}
                {doc.focusAreas && doc.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {doc.focusAreas.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#0F766E]/10 text-[#0F766E] text-[0.6875rem] font-semibold border border-[#0F766E]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Languages & Schedule */}
                <div className="flex items-center gap-4 text-xs text-[#586151] pt-2 border-t border-[rgba(18,22,15,0.06)] flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-[#2E7D32]" />
                    {doc.durationMinutes || 30} min session
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={12} className="text-[#2E6DA4]" />
                    {doc.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between gap-2">
                <span className="text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider">
                  Telehealth Session
                </span>
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(18,22,15,0.15)] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[rgba(18,22,15,0.08)] bg-[#FAFAF6]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: selectedDoctor.avatarColor || '#2E7D32' }}
                >
                  {selectedDoctor.avatarInitials}
                </div>
                <div>
                  <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                    Book with {selectedDoctor.name}
                  </h3>
                  <p className="text-[0.6875rem] text-[#586151] m-0">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-[#8A9482] hover:text-[#12160F] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {bookingError && (
                <div className="p-3 mb-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              {/* Step 1: Details & Date */}
              {bookingStep === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Select Consultation Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Select Preferred Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            selectedTime === slot
                              ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                              : 'bg-[#FAFAF6] text-[#586151] border-[rgba(18,22,15,0.12)]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#12160F]">
                        Reason for Consultation / Health Concern <span className="text-[#DC2626]">*</span>
                      </label>
                      <span className="text-[0.65rem] text-[#2E7D32] font-semibold flex items-center gap-1">
                        <ShieldCheck size={11} /> 100% Confidential
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder={
                        selectedDoctor.id === 'dr_swati_dixit'
                          ? "Share your concern freely (e.g., irregular periods, hormonal imbalance, PCOS/PCOD issues, metabolic fatigue, thyroid, or lab report review)..."
                          : "Describe your primary concern (e.g., hormonal optimization, rehabilitation, clinical lab review, metabolic health)..."
                      }
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                    />
                    <p className="text-[0.6875rem] text-[#586151] mt-1 m-0">
                      Your discussion notes are fully encrypted and only visible to your assigned specialist.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">
                      Reported Symptoms (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      placeholder={
                        selectedDoctor.id === 'dr_swati_dixit'
                          ? "e.g. Irregular cycles, cramps, fatigue, hormonal acne, mood changes"
                          : "e.g. Joint stiffness, fatigue, sleep disturbances"
                      }
                      value={symptomsInput}
                      onChange={e => setSymptomsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Clinical Consent Scopes */}
              {bookingStep === 'consent' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-xl flex items-start gap-2.5">
                    <Lock size={15} className="text-[#2E7D32] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2E7D32] m-0">Patient Consent &amp; Telehealth Protection</h4>
                      <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">
                        In accordance with clinical telehealth regulations, authorize which personal health telemetry {selectedDoctor.name} may access during your session.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'healthHistory', label: 'Basic Health & Lifestyle Background' },
                      { id: 'previousConsultations', label: 'Prior Consultation Notes' },
                      { id: 'relevantReports', label: 'Uploaded Diagnostic Reports & Labs' },
                      { id: 'currentMedications', label: 'Medications & Supplements List' },
                      { id: 'workoutHistory', label: 'Recent Training & Performance Logs' },
                      { id: 'nutritionLogs', label: 'Daily Nutrition & Meal Logs' },
                    ].map(scope => (
                      <label
                        key={scope.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-[#12160F]">{scope.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(consentScopes[scope.id])}
                          onChange={e =>
                            setConsentScopes(prev => ({ ...prev, [scope.id]: e.target.checked }))
                          }
                          className="accent-[#2E7D32]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation Feedback */}
              {bookingStep === 'confirmed' && (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] flex items-center justify-center mb-3">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                    Consultation Requested!
                  </h3>
                  <p className="text-xs text-[#586151] mt-1 m-0">
                    Scheduled for {selectedDate} at {selectedTime}. Redirecting to your care panel...
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {bookingStep !== 'confirmed' && (
              <div className="p-4 border-t border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] flex items-center justify-between">
                {bookingStep === 'details' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="text-xs font-semibold text-[#586151] hover:text-[#12160F] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!reason.trim()) {
                          setBookingError('Please describe your reason for this consultation.');
                          return;
                        }
                        setBookingStep('consent');
                      }}
                      className="btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Review Consent →
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setBookingStep('details')}
                      disabled={submitting}
                      className="text-xs font-semibold text-[#586151] hover:text-[#12160F] cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                      className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Confirming Booking...
                        </>
                      ) : (
                        'Book & Authorize Consent'
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
