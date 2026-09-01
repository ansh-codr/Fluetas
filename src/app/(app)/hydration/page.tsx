'use client';

import React, { useState } from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import { mockHydrationLogs, mockHydrationWeek } from '@/lib/mock/dashboardData';
import {
  Droplets,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  CupSoda,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function HydrationPage() {
  const [currentIntake, setCurrentIntake] = useState(1800); // 1.8L
  const [goal, setGoal] = useState(2500); // 2.5L
  const [logs, setLogs] = useState(mockHydrationLogs);

  const addWater = (amount: number, type = 'Pure Filtered Water') => {
    const newIntake = currentIntake + amount;
    setCurrentIntake(newIntake);
    setLogs([
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: amount,
        type: type,
      },
      ...logs,
    ]);
  };

  const pct = Math.round((currentIntake / goal) * 100);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
          HYDRATION TRACKER & ELECTROLYTE SYNC
        </h1>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          Optimal cellular hydration, blood volume regulation, and workout recovery pacing.
        </p>
      </div>

      {/* Main Hydration Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Big Ring Card */}
        <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#13161F] to-[#0A202E] border-[#38BDF8]/30">
          <CircleProgress
            score={currentIntake}
            max={goal}
            size={160}
            strokeWidth={12}
            color="#38BDF8"
            trackColor="#0C4A6E"
            label={`${(currentIntake / 1000).toFixed(2)}L`}
          />
          <div className="mt-3">
            <p className="font-['Outfit'] text-lg font-bold text-[#E8EAF6] m-0">
              {pct}% of Daily Goal
            </p>
            <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
              Goal: {(goal / 1000).toFixed(1)}L · {Math.max(0, goal - currentIntake)} ml remaining
            </p>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-4">
          <div>
            <span className="section-title">QUICK LOG INTAKE</span>
            <p className="text-xs text-[#8B91B0] m-0 mt-1 mb-4">
              Tap any button below to instantly append your water log.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: '+250 ml', ml: 250, desc: 'Small Glass' },
                { label: '+500 ml', ml: 500, desc: 'Standard Bottle' },
                { label: '+750 ml', ml: 750, desc: 'Sports Shaker' },
                { label: '+1,000 ml', ml: 1000, desc: 'Full Pitcher' },
              ].map(btn => (
                <button
                  key={btn.ml}
                  onClick={() => addWater(btn.ml)}
                  className="p-3 rounded-xl bg-[#0B0D14] border border-[#1E2133] hover:border-[#38BDF8] hover:bg-[#38BDF8]/10 text-left transition-all cursor-pointer group"
                >
                  <Droplets size={16} className="text-[#38BDF8] mb-1 group-hover:scale-110 transition-transform" />
                  <p className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">{btn.label}</p>
                  <p className="text-[0.65rem] text-[#8B91B0] m-0">{btn.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-semibold">
              <Sparkles size={16} />
              <span>RECOVER+ Electrolyte recommended after training sessions.</span>
            </div>
            <button
              onClick={() => addWater(350, 'FLUETAS RECOVER+ Hydration Mix')}
              className="px-3 py-1.5 rounded-lg bg-[#10B981] text-black text-xs font-bold shrink-0 hover:opacity-90 cursor-pointer"
            >
              + Log RECOVER+
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Hydration Trend */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#38BDF8]" />
            <span className="section-title">WEEKLY HYDRATION CONSISTENCY</span>
          </div>
          <span className="text-xs text-[#38BDF8] font-bold">Average: 2.4L / day</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockHydrationWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} unit="L" />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="intake" name="Water Intake (L)" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Log Timeline */}
      <div className="fluetas-card p-5">
        <span className="section-title">TODAY&apos;S INTAKE ENTRIES ({logs.length})</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center">
                  <Droplets size={15} />
                </div>
                <div>
                  <p className="font-bold text-[#E8EAF6] m-0">+{log.amount} ml</p>
                  <p className="text-[0.68rem] text-[#8B91B0] m-0">{log.type}</p>
                </div>
              </div>
              <span className="text-[0.7rem] text-[#8B91B0] font-medium">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
