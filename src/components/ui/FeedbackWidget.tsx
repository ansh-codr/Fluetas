'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, Sparkles } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { FeedbackCategory } from '@/lib/services/feedbackService';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('praise');
  const [initialRating, setInitialRating] = useState<number>(5);

  useEffect(() => {
    // Listen for custom open-feedback events from anywhere in the app
    const handleOpenFeedback = (event: CustomEvent<{ category?: FeedbackCategory; rating?: number }>) => {
      if (event.detail?.category) {
        setCategory(event.detail.category);
      }
      if (event.detail?.rating) {
        setInitialRating(event.detail.rating);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-feedback-modal' as any, handleOpenFeedback);
    return () => {
      window.removeEventListener('open-feedback-modal' as any, handleOpenFeedback);
    };
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#12160F] text-[#FAFAF6] shadow-[0_8px_30px_rgb(0,0,0,0.18)] hover:bg-[#2E7D32] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 cursor-pointer"
          aria-label="Send Feedback"
          title="Share Feedback & Suggestions"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquareHeart size={18} className="text-[#FAFAF6] group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D9622B] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D9622B] rounded-full" />
          </div>
          <span className="font-['Outfit'] text-xs font-bold tracking-wide hidden sm:inline-block">
            Feedback
          </span>
        </button>
      </div>

      {/* Interactive Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultCategory={category}
        initialRating={initialRating}
      />
    </>
  );
}

/**
 * Utility helper to trigger the feedback modal from any component
 */
export function openFeedbackDialog(options?: { category?: FeedbackCategory; rating?: number }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open-feedback-modal', {
        detail: options || {},
      })
    );
  }
}
