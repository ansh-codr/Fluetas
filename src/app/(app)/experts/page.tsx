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
  CheckCircle2,
  X,
  Filter,
  Loader2,
  ShieldCheck,
  Globe,
  Award,
} from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

export default function ExpertsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<VerifiedExpert | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [booked, setBooked] = useState(false);

  // Booking Form
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');

  const specializations = [
    'All',
    "Women's Health",
    'Physician',
    'Nutrition',
    'Endocrinology',
    'Physio',
  ];

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);

    getVerifiedExperts()
      .then(res => { setExperts(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredDoctors = filter === 'All'
    ? experts
    : experts.filter(d =>
        d.specialization.toLowerCase().includes(filter.toLowerCase()) ||
        d.focusAreas?.some(f => f.toLowerCase().includes(filter.toLowerCase()))
      );

  const handleBook = async () => {
    if (!user || !selectedDoctor) return;
    if (!reason.trim()) {
      setBookingError('Please describe your reason for the visit.');
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      await bookConsultation(user.uid, {
        expertId: selectedDoctor.id,
        expertName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        reason: reason.trim(),
        symptomsReported: [],
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        consentScopes: {
          healthHistory: true,
          previousConsultations: true,
          relevantReports: true,
          currentMedications: true,
        },
      });

      setBooked(true);
      setTimeout(() => {
        setSelectedDoctor(null);
        setBooked(false);
        router.push('/consultations');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
          Find a Doctor
        </h1>
        <p className="text-[#586151] text-xs sm:text-sm m-0 mt-0.5">
          Book a video consultation with verified specialists.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {specializations.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filter === s
                ? 'bg-[#2E7D32] text-white'
                : 'bg-[#F2F4EE] text-[#586151] hover:bg-[#E8EBE4]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Doctors */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[rgba(18,22,15,0.08)]">
          <Stethoscope size={28} className="text-[#2E7D32] mx-auto mb-3" />
          <p className="font-bold text-[#12160F] m-0">No doctors found</p>
          <p className="text-xs text-[#586151] m-0 mt-1">Check back soon for available specialists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="p-5 bg-white rounded-2xl border border-[rgba(18,22,15,0.08)] hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                {doc.imageUrl ? (
                  <img src={doc.imageUrl} alt={doc.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: doc.avatarColor || '#2E7D32' }}>
                    {doc.avatarInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#12160F] m-0 truncate">{doc.name}</h3>
                    <span className="text-[0.6rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-1.5 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-[#2E7D32] text-xs font-semibold m-0">{doc.specialization}</p>
                  <p className="text-[#8A9482] text-[0.68rem] m-0">{doc.experience} exp</p>
                </div>
              </div>

              {doc.focusAreas && doc.focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.focusAreas.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#F2F4EE] text-[#586151] text-[0.65rem] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[rgba(18,22,15,0.06)]">
                <span className="text-[0.68rem] text-[#586151] flex items-center gap-1">
                  <Clock size={11} /> {doc.durationMinutes || 30} min
                </span>
                <button
                  onClick={() => { setSelectedDoctor(doc); setBooked(false); setReason(''); setBookingError(''); }}
                  className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(18,22,15,0.08)]">
              <div>
                <h3 className="font-bold text-[#12160F] m-0">Book with {selectedDoctor.name}</h3>
                <p className="text-[0.68rem] text-[#586151] m-0">{selectedDoctor.specialization}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="p-1 rounded-lg hover:bg-[#F2F4EE] cursor-pointer">
                <X size={18} className="text-[#586151]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {bookingError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {bookingError}
                </div>
              )}

              {booked ? (
                <div className="py-6 text-center">
                  <CheckCircle2 size={36} className="text-[#2E7D32] mx-auto mb-2" />
                  <p className="font-bold text-[#12160F] m-0">Booked!</p>
                  <p className="text-xs text-[#586151] m-0 mt-1">Redirecting...</p>
                </div>
              ) : (
                <>
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs outline-none focus:border-[#2E7D32]"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">Time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
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

                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-bold text-[#12160F] mb-1">
                      Why do you want to visit? *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Back pain, diet advice, general checkup..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs outline-none focus:border-[#2E7D32]"
                    />
                  </div>

                  <p className="text-[0.6rem] text-[#8A9482] m-0 flex items-center gap-1">
                    <ShieldCheck size={10} /> Your data is encrypted and private
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            {!booked && (
              <div className="p-4 border-t border-[rgba(18,22,15,0.08)] flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <><Loader2 size={12} className="animate-spin" /> Booking...</> : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
