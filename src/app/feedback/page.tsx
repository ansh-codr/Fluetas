'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Sparkles,
  MessageSquareHeart,
  Lightbulb,
  Bug,
  Heart,
  Stethoscope,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Filter,
  PlusCircle,
  ThumbsUp,
} from 'lucide-react';
import {
  getPublicFeedbacks,
  FeedbackSubmission,
  FeedbackCategory,
} from '@/lib/services/feedbackService';
import { openFeedbackDialog } from '@/components/ui/FeedbackWidget';

const ROADMAP_ITEMS = [
  {
    title: 'Apple Health & Garmin Biomarker Bi-directional Sync',
    category: 'Integrations',
    status: 'Shipped',
    statusColor: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30',
    votes: 342,
    desc: 'Seamless continuous background sync of resting heart rate, HRV, sleep stages, and VO2 max.',
  },
  {
    title: 'Fluetas Her Hormonal Phase Phase-Matched Recipes',
    category: 'Fluetas Her',
    status: 'In Progress',
    statusColor: 'bg-[#D9622B]/10 text-[#D9622B] border-[#D9622B]/30',
    votes: 289,
    desc: 'Personalized micronutrient and botanical meal templates tailored specifically to luteal vs follicular phases.',
  },
  {
    title: 'AI Consultation Summary Audio Briefings',
    category: 'AI Coach',
    status: 'Planned',
    statusColor: 'bg-[#2E6DA4]/10 text-[#2E6DA4] border-[#2E6DA4]/30',
    votes: 198,
    desc: 'Audio breakdown of clinical notes and prescription adjustments voiced by your AI health coach.',
  },
  {
    title: 'Offline Video Library Workout Player',
    category: 'Workouts',
    status: 'Planned',
    statusColor: 'bg-[#8A9482]/10 text-[#586151] border-[#8A9482]/30',
    votes: 156,
    desc: 'Download high-definition mobility and resistance routines for travel without cell connectivity.',
  },
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [activeCategory, setActiveCategory] = useState<FeedbackCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublicFeedbacks(activeCategory)
      .then(res => {
        setFeedbacks(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAF6] text-[#12160F] flex flex-col selection:bg-[#2E7D32]/20">
      {/* Navigation Header */}
      <header className="border-b border-[rgba(18,22,15,0.08)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#12160F]/5 group-hover:scale-105 transition-transform">
              <img src="/assets/image.png" alt="FLUETAS" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] font-black text-sm tracking-widest text-[#12160F] uppercase">
                FLUETAS
              </span>
              <span className="text-[0.60rem] tracking-wider text-[#586151] uppercase -mt-0.5">
                Feedback &amp; Community Voice
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#586151] hover:text-[#12160F] no-underline hidden sm:inline-block"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => openFeedbackDialog()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256328] transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <PlusCircle size={14} />
              <span>Give Feedback</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 border-b border-[rgba(18,22,15,0.08)] bg-gradient-to-b from-white to-[#FAFAF6]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold font-['Outfit'] uppercase tracking-wider">
            <Sparkles size={14} />
            Community-Driven Development
          </div>

          <h1 className="font-['Outfit'] text-3xl sm:text-5xl font-black text-[#12160F] tracking-tight m-0">
            Your Voice Shapes <span className="text-[#2E7D32]">FLUETAS</span>
          </h1>

          <p className="text-sm sm:text-base text-[#586151] max-w-2xl mx-auto leading-relaxed m-0">
            We are building the future of sovereign health and human performance. Every feature request, clinical insight, and user suggestion directly impacts our engineering roadmap.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => openFeedbackDialog({ category: 'praise', rating: 5 })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#12160F] text-[#FAFAF6] text-xs font-bold hover:bg-[#2E7D32] transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Heart size={16} className="text-[#D9622B]" />
              <span>Share a Review</span>
            </button>
            <button
              onClick={() => openFeedbackDialog({ category: 'feature' })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs font-bold hover:border-[#2E7D32] transition-all shadow-xs cursor-pointer hover:scale-105"
            >
              <Lightbulb size={16} className="text-[#2E7D32]" />
              <span>Suggest a Feature</span>
            </button>
            <button
              onClick={() => openFeedbackDialog({ category: 'bug' })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[rgba(18,22,15,0.12)] text-[#586151] text-xs font-bold hover:text-red-600 hover:border-red-300 transition-all shadow-xs cursor-pointer"
            >
              <Bug size={16} />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Platform Satisfaction', val: '4.95 / 5', sub: 'Across 1,400+ reviews' },
            { label: 'Community Suggestions', val: '280+', sub: 'Active roadmap votes' },
            { label: 'Feature Delivery', val: '84%', sub: 'Community requests built' },
            { label: 'Avg Doctor Rating', val: '4.98 ★', sub: 'Clinical consultations' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-[rgba(18,22,15,0.08)] text-center shadow-xs">
              <p className="font-['Outfit'] text-lg sm:text-2xl font-black text-[#12160F] m-0">{stat.val}</p>
              <p className="text-xs font-bold text-[#2E7D32] m-0 mt-0.5">{stat.label}</p>
              <p className="text-[0.625rem] text-[#8A9482] m-0 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-16">
        
        {/* Section 1: Community Feedback & Spotlight Reviews */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
                Community Reviews &amp; Perspectives
              </h2>
              <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1">
                Real feedback from athletes, patients, and clinical practitioners.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Reviews' },
                { id: 'praise', label: 'Praise & Experience' },
                { id: 'feature', label: 'Features' },
                { id: 'consultation', label: 'Doctor Care' },
                { id: 'nutrition', label: 'Formulas' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#12160F] text-[#FAFAF6]'
                      : 'bg-white border border-[rgba(18,22,15,0.1)] text-[#586151] hover:text-[#12160F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#586151]">
              <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading reviews...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map(item => (
                <div
                  key={item.id || item.title}
                  className="p-6 rounded-2xl bg-white border border-[rgba(18,22,15,0.08)] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            className={
                              s <= item.rating
                                ? 'fill-[#D9622B] text-[#D9622B]'
                                : 'text-gray-200'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[0.625rem] font-bold text-[#8A9482] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0 line-clamp-2">
                      &quot;{item.title}&quot;
                    </h3>

                    <p className="text-xs text-[#586151] leading-relaxed m-0">
                      {item.message}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map(t => (
                          <span
                            key={t}
                            className="text-[0.60rem] px-2 py-0.5 rounded-md bg-[#FAFAF6] text-[#586151] border border-[rgba(18,22,15,0.06)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[rgba(18,22,15,0.06)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#12160F] m-0">{item.userName}</p>
                      <p className="text-[0.625rem] text-[#8A9482] m-0">{item.userRole || 'Verified Member'}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#E8ECE2] flex items-center justify-center text-xs font-bold text-[#2E7D32]">
                      {item.userName[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Transparency Roadmap */}
        <div className="rounded-3xl bg-white border border-[rgba(18,22,15,0.08)] p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D32] uppercase font-['Outfit'] tracking-wider mb-2">
              <TrendingUp size={14} />
              Public Product Roadmap
            </div>
            <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              Features Built From Your Feedback
            </h2>
            <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1 leading-relaxed">
              We publicly track the most requested capabilities from the community. Vote or propose items below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROADMAP_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.18)] transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[0.625rem] font-bold text-[#586151] uppercase tracking-wider font-['Outfit']">
                      {item.category}
                    </span>
                    <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#586151] m-0 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgba(18,22,15,0.06)]">
                  <span className="text-[0.6875rem] font-semibold text-[#586151] flex items-center gap-1">
                    <ThumbsUp size={12} className="text-[#2E7D32]" />
                    {item.votes} community upvotes
                  </span>
                  <button
                    onClick={() => openFeedbackDialog({ category: 'feature', rating: 5 })}
                    className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Suggest Improvement</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(18,22,15,0.08)] bg-white py-8 text-center text-xs text-[#8A9482]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="m-0">© 2026 FLUETAS Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#12160F] text-[#586151] no-underline">Home</Link>
            <Link href="/dashboard" className="hover:text-[#12160F] text-[#586151] no-underline">Dashboard</Link>
            <Link href="/settings" className="hover:text-[#12160F] text-[#586151] no-underline">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
