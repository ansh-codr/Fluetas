'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { mockWeeklyProgress } from '@/lib/mock/dashboardData';

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
  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="section-title">WEEKLY PROGRESS</span>
        <select
          id="weekly-chart-range-select"
          style={{
            background: '#0B0D14', border: '1px solid #1E2133',
            borderRadius: 6, color: '#8B91B0', fontSize: '0.75rem',
            padding: '4px 8px', cursor: 'pointer', outline: 'none',
          }}
        >
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={mockWeeklyProgress} barGap={4} barCategoryGap="25%">
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
            name="Workouts"
            dataKey="workouts"
            fill="#10B981"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          />
          <Bar
            name="Calories (kcal)"
            dataKey="calories"
            fill="#F59E0B"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
            hide={false}
          />
          <Bar
            name="Sleep (hrs)"
            dataKey="sleep"
            fill="#A78BFA"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
