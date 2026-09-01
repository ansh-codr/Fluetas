import React from 'react';
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

export const metadata = {
  title: 'Dashboard — FLUETAS | Your Body. Your Data. Your Formula.',
  description: 'Your daily wellness overview: workouts, nutrition, hydration, sleep, and upcoming consultations.',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* ── Row 1: Wellness Rings + Today's Focus ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_260px] gap-4 items-start">
        <WellnessRings />
        <div className="w-full">
          <TodaysFocusCard />
        </div>
      </div>

      {/* ── Row 2: Appointments + Weekly Chart + AI Coach ────────────────── */}
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

      {/* ── Row 3: Product Carousel with Upcoming Treatment ──────────────── */}
      <div className="w-full">
        <ProductCarousel />
      </div>

      {/* ── Row 4: Workout + Cycle + Nutrition + Activity ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <TodaysWorkout />
        <CycleTracker />
        <TodaysNutrition />
        <RecentActivity />
      </div>

      {/* Fixed bottom quick-actions bar */}
      <QuickActions />
    </div>
  );
}
