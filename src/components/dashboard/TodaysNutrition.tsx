'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ProgressBar from '@/components/ui/ProgressBar';
import { mockNutrition } from '@/lib/mock/dashboardData';

export default function TodaysNutrition() {
  const { calories, caloriesTarget, macros } = mockNutrition;
  const pct = Math.round((calories / caloriesTarget) * 100);

  const donutData = [
    { value: calories },
    { value: caloriesTarget - calories },
  ];

  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="section-title">TODAY&apos;S NUTRITION</span>
        <button
          id="track-meal-btn"
          className="btn-primary"
          style={{ padding: '5px 12px', fontSize: '0.72rem' }}
        >
          Track Meal
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie
                data={donutData}
                cx={40}
                cy={40}
                innerRadius={30}
                outerRadius={42}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#10B981" />
                <Cell fill="#1E2133" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 800, color: '#E8EAF6', lineHeight: 1 }}>
              {calories.toLocaleString()}
            </span>
            <span style={{ color: '#8B91B0', fontSize: '0.55rem', fontWeight: 500 }}>kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div style={{ flex: 1 }}>
          {macros.map(macro => (
            <div key={macro.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#E8EAF6', fontSize: '0.75rem', fontWeight: 500 }}>{macro.name}</span>
                <span style={{ color: '#8B91B0', fontSize: '0.68rem' }}>
                  {macro.current}{macro.unit}/{macro.target}{macro.unit}
                </span>
              </div>
              <ProgressBar
                value={(macro.current / macro.target) * 100}
                color={macro.color}
                height={5}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <p style={{ color: '#8B91B0', fontSize: '0.68rem', margin: '0 0 6px' }}>
          {pct}% of daily goal · {(caloriesTarget - calories).toLocaleString()} kcal remaining
        </p>
        <button
          id="view-nutrition-details-btn"
          style={{
            background: 'none', border: 'none', color: '#10B981',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          View Nutrition Details →
        </button>
      </div>
    </div>
  );
}
