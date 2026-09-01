'use client';

import React from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useAuth } from '@/context/AuthContext';
import WellnessRings from '@/components/dashboard/WellnessRings';
import TodaysFocusCard from '@/components/dashboard/TodaysFocusCard';
import AppointmentsCard from '@/components/dashboard/AppointmentsCard';
import WeeklyProgressChart from '@/components/dashboard/WeeklyProgressChart';
import AICoachCard from '@/components/dashboard/AICoachCard';
import ProductCarousel from '@/components/dashboard/ProductCarousel';
import TodaysWorkout from '@/components/dashboard/TodaysWorkout';
import CycleTracker from '@/components/dashboard/CycleTracker';
import TodaysNutrition from '@/components/dashboard/TodaysNutrition';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import { StaggerItem } from '@/components/motion/MotionUtils';
import { Sparkles } from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { profile } = useUserProfile();
  const { user } = useAuth();

  const greeting = getGreeting();
  const displayName = profile?.name || user?.displayName || 'there';

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* ── Staggered Section 1: Dynamic Greeting Header ─────────────────── */}
      <StaggerItem index={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0 tracking-tight flex items-center gap-2">
              <span>{greeting}, {displayName}</span>
              <span className="text-[#10B981] inline-block animate-pulse">✨</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8B91B0] m-0 mt-0.5">
              Here&apos;s your personalized health and wellness telemetry for today.
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* ── Staggered Section 2: Wellness Rings + Today's Focus ───────────── */}
      <StaggerItem index={1}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_260px] gap-4 items-start">
          <WellnessRings />
          <div className="w-full">
            <TodaysFocusCard />
          </div>
        </div>
      </StaggerItem>

      {/* ── Staggered Section 3: Appointments + Weekly Chart + AI Coach ───── */}
      <StaggerItem index={2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_1fr_250px] gap-4 items-stretch">
          <div className="w-full order-2 md:order-1 lg:order-1">
            <AppointmentsCard />
          </div>
          <div className="w-full order-1 md:order-3 md:col-span-2 lg:col-span-1 lg:order-2">
            <WeeklyProgressChart />
          </div>
          <div className="w-full order-3 md:order-2 lg:order-3">
            <AICoachCard />
          </div>
        </div>
      </StaggerItem>

      {/* ── Staggered Section 4: Physical Formula Carousel ─────────────────── */}
      <StaggerItem index={3}>
        <div className="w-full">
          <ProductCarousel />
        </div>
      </StaggerItem>

      {/* ── Staggered Section 5: Workout + Cycle + Nutrition + Activity ────── */}
      <StaggerItem index={4}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          <TodaysWorkout />
          <CycleTracker />
          <TodaysNutrition />
          <RecentActivity />
        </div>
      </StaggerItem>

      {/* Fixed bottom quick-actions bar */}
      <QuickActions />
    </div>
  );
}
