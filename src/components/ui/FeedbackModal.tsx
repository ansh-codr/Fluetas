'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  Bug,
  Lightbulb,
  Heart,
  Stethoscope,
  ShoppingBag,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import {
  submitFeedback,
  FeedbackCategory,
  FeedbackSubmission,
} from '@/lib/services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FeedbackCategory;
  initialRating?: number;
}

const CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  desc: string;
}[] = [
  { id: 'praise', label: 'Review / Praise', icon: Heart, desc: 'Share your positive experience' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, desc: 'Suggest new capability or tool' },
  { id: 'bug', label: 'Bug Report', icon: Bug, desc: 'Report an issue or unexpected behavior' },
  { id: 'consultation', label: 'Doctor & Care', icon: Stethoscope, desc: 'Feedback on clinical consultations' },
  { id: 'nutrition', label: 'Products / Store', icon: ShoppingBag, desc: 'Formulas, hydration & store' },
  { id: 'general', label: 'General Feedback', icon: MessageSquare, desc: 'Anything else on your mind' },
];

const QUICK_TAGS: Record<FeedbackCategory, string[]> = {
  praise: ['Loved UI Design', 'Smooth Workflow', 'AI Coach Guidance', 'Great Doctors', 'Holistic Concept'],
  feature: ['Apple Watch / Garmin Sync', 'Barcode Scanner', 'Dark Theme', 'Offline Workouts', 'Export PDF Records'],
  bug: ['Page Loading Delay', 'Video Playback Glitch', 'Form Validation Error', 'Bluetooth Sync Issue', 'Layout Shift'],
  consultation: ['Doctor was Thorough', 'Clear Recommendations', 'Punctual Timing', 'Need More Specialties'],
  nutrition: ['Loved Natural Ingredients', 'Clean Packaging', 'Great Taste Profile', 'Want More Flavors'],
  general: ['Website Usability', 'Navigation Ease', 'Mobile Responsiveness', 'Overall Impression'],
};

const RATING_EMOTIONS = [
  { text: 'Select rating', emoji: '✨' },
  { text: 'Needs Improvement', emoji: '🙁' },
  { text: 'Fair', emoji: '😐' },
  { text: 'Good Experience', emoji: '🙂' },
  { text: 'Very Satisfied', emoji: '😊' },
  { text: 'Exceptional & Loved It!', emoji: '🌟' },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  defaultCategory = 'praise',
  initialRating = 5,
}: FeedbackModalProps) {
  const { user, role } = useAuth();
  const { profile } = useUserProfile();

  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user || profile) {
      setName(profile?.name || user?.displayName || '');
      setEmail(user?.email || '');
    }
  }, [user, profile]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setCategory(defaultCategory);
      setRating(initialRating);
    }
  }, [isOpen, defaultCategory, initialRating]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please provide your feedback details before submitting.');
      return;
    }
    if (rating === 0) {
      setErrorMessage('Please select a star rating.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname : undefined;
      await submitFeedback({
        userId: user?.uid,
        userName: name.trim() || (user?.displayName || 'Anonymous Contributor'),
        userEmail: email.trim() || user?.email || undefined,
        userRole: role || (user ? 'member' : 'visitor'),
        category,
        rating,
        title: title.trim() || `${CATEGORIES.find(c => c.id === category)?.label || 'Feedback'} (${rating}★)`,
        message: message.trim(),
        tags: selectedTags,
        pageUrl,
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMessage(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEmotionIndex = hoverRating || rating;
  const currentEmotion = RATING_EMOTIONS[activeEmotionIndex] || RATING_EMOTIONS[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in overflow-y-auto">
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[rgba(18,22,15,0.12)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
                Share Your Feedback
              </h2>
              <p className="text-[0.6875rem] text-[#586151] m-0">
                Your thoughts help craft the future of FLUETAS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] hover:bg-[#E8ECE2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isSuccess ? (
            <div className="py-10 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#12160F] m-0">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-xs text-[#586151] max-w-md mx-auto mt-2 leading-relaxed">
                  We have logged your suggestions directly to our product roadmap. Every perspective helps us build a more thoughtful health platform.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256328] transition-colors cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Category Selector */}
              <div>
                <label className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit'] mb-2">
                  Feedback Topic
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id);
                          setSelectedTags([]);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32] font-semibold shadow-2xs'
                            : 'bg-[#FAFAF6] border-[rgba(18,22,15,0.08)] text-[#586151] hover:border-[rgba(18,22,15,0.2)] hover:text-[#12160F]'
                        }`}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Star Rating */}
              <div className="p-4 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-bold text-[#12160F]">
                    How was your overall experience?
                  </span>
                  <span className="text-[0.6875rem] text-[#586151] flex items-center gap-1 mt-0.5">
                    <span>{currentEmotion.emoji}</span>
                    <span>{currentEmotion.text}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(starNum => {
                    const isFilled = (hoverRating || rating) >= starNum;
                    return (
                      <button
                        key={starNum}
                        type="button"
                        onMouseEnter={() => setHoverRating(starNum)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starNum)}
                        className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        aria-label={`Rate ${starNum} stars`}
                      >
                        <Star
                          size={22}
                          className={
                            isFilled
                              ? 'fill-[#D9622B] text-[#D9622B]'
                              : 'text-[#8A9482]/40'
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quick Tag Pills */}
              {QUICK_TAGS[category] && QUICK_TAGS[category].length > 0 && (
                <div>
                  <label className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit'] mb-1.5">
                    Quick Highlights (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAGS[category].map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-[0.6875rem] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#12160F] text-[#FAFAF6] border-[#12160F] font-semibold'
                              : 'bg-white border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:bg-[#F2F4EE]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Subject / Title */}
              <div>
                <label
                  htmlFor="feedback-title"
                  className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit'] mb-1"
                >
                  Headline or Summary (Optional)
                </label>
                <input
                  id="feedback-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Loved the cycle tracking feature, or Workout video glitch"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[rgba(18,22,15,0.12)] focus:border-[#2E7D32] focus:outline-none transition-colors"
                />
              </div>

              {/* 5. Message / Detail */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="feedback-message"
                    className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit']"
                  >
                    Your Feedback <span className="text-[#D9622B]">*</span>
                  </label>
                  <span className="text-[0.625rem] text-[#8A9482]">
                    {message.length}/1000
                  </span>
                </div>
                <textarea
                  id="feedback-message"
                  required
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what you loved, what felt clunky, or what you'd like to see next..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-[rgba(18,22,15,0.12)] focus:border-[#2E7D32] focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* 6. Name and Email for guests or override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label
                    htmlFor="feedback-name"
                    className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit'] mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[rgba(18,22,15,0.12)] focus:border-[#2E7D32] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedback-email"
                    className="block text-[0.6875rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit'] mb-1"
                  >
                    Contact Email (For follow-up)
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[rgba(18,22,15,0.12)] focus:border-[#2E7D32] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between gap-3">
                <span className="text-[0.625rem] text-[#8A9482]">
                  🔒 Your insights are processed respectfully.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-[#586151] hover:text-[#12160F] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256328] disabled:opacity-50 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
