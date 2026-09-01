'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { getWeeklySleep } from '@/lib/services/sleepService';
import { getWeeklyHydration } from '@/lib/services/hydrationService';
import { getWeeklyNutrition } from '@/lib/services/nutritionService';

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#13161F',
        border: '1px solid #1E2133',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.75rem',
        color: '#E8EAF6',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6, color: '#8B91B0' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ color: '#8B91B0' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function WeeklyProgressChart() {
  const { user } = useAuth();
  const [data, setData] = useState<{ day: string; hydration: number; sleep: number; calories: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      getWeeklyHydration(user.uid),
      getWeeklySleep(user.uid),
      getWeeklyNutrition(user.uid),
    ])
      .then(([hydr, sleep, nutr]) => {
        const combined = hydr.map((h, i) => ({
          day: dayLabel(h.date),
          hydration: Math.round(h.totalMl / 100) / 10, // in Litres
          sleep: sleep[i]?.durationHrs ?? 0,
          calories: nutr[i]?.calories ?? 0,
        }));
        setData(combined);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  const hasData = data.some(d => d.hydration > 0 || d.sleep > 0 || d.calories > 0);

  return (
    <div className="fluetas-card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="section-title">WEEKLY PROGRESS</span>
        <span className="text-[0.65rem] text-[#8B91B0]">Last 7 Days</span>
      </div>

      {loading ? (
        <div className="h-[180px] bg-[#1E2133]/40 rounded-xl animate-pulse flex items-center justify-center">
          <span className="text-xs text-[#8B91B0]">Loading trends...</span>
        </div>
      ) : !hasData ? (
        <div className="h-[180px] flex flex-col items-center justify-center text-center p-4">
          <p className="text-2xl mb-1">📈</p>
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">No weekly history yet</p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-1">
            As you log daily hydration, sleep, and nutrition, your weekly trends appear here.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barGap={4} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#8B91B0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,33,51,0.4)' }} />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.72rem', color: '#8B91B0', paddingTop: 8 }}
            />
            <Bar
              name="Hydration (L)"
              dataKey="hydration"
              fill="#38BDF8"
              radius={[3, 3, 0, 0]}
              maxBarSize={14}
            />
            <Bar
              name="Sleep (hrs)"
              dataKey="sleep"
              fill="#A78BFA"
              radius={[3, 3, 0, 0]}
              maxBarSize={14}
            />
            <Bar
              name="Calories (kcal)"
              dataKey="calories"
              fill="#10B981"
              radius={[3, 3, 0, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
