'use client';

import React from 'react';
import { mockTodaysWorkout } from '@/lib/mock/dashboardData';

export default function TodaysWorkout() {
  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="section-title">TODAY&apos;S WORKOUT</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '1rem',
              color: '#E8EAF6', margin: '0 0 2px',
            }}
          >
            {mockTodaysWorkout.name}
          </h3>
          <p style={{ color: '#8B91B0', fontSize: '0.72rem', margin: 0 }}>{mockTodaysWorkout.focus}</p>
        </div>
        <button
          id="start-workout-btn"
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '0.8rem' }}
        >
          ▶ Start Workout
        </button>
      </div>

      {/* Body diagram placeholder */}
      <div
        style={{
          height: 90,
          background: '#0B0D14',
          borderRadius: 10,
          border: '1px solid #1E2133',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          fontSize: 40,
        }}
      >
        🏃
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Exercises', value: mockTodaysWorkout.exercises, emoji: '💪' },
          { label: 'Duration', value: mockTodaysWorkout.duration, emoji: '⏱️' },
          { label: 'Level', value: mockTodaysWorkout.level, emoji: '📊' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: '#0B0D14',
              borderRadius: 8,
              padding: '8px 10px',
              border: '1px solid #1E2133',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 14, margin: '0 0 2px' }}>{stat.emoji}</p>
            <p style={{ color: '#E8EAF6', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 2px' }}>{stat.value}</p>
            <p style={{ color: '#8B91B0', fontSize: '0.62rem', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <button
        id="view-workout-plan-btn"
        style={{
          background: 'none', border: 'none', color: '#10B981',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0,
        }}
      >
        View Workout Plan →
      </button>
    </div>
  );
}
