'use client';

import React from 'react';
import { mockCycleData } from '@/lib/mock/dashboardData';

const phaseColors: Record<string, string> = {
  Period:     '#F472B6',
  Follicular: '#38BDF8',
  Ovulation:  '#10B981',
  Luteal:     '#A78BFA',
};

export default function CycleTracker() {
  const { currentDay, phase, daysToOvulation, weekDays, logs } = mockCycleData;

  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="section-title">CYCLE TRACKER</span>
      </div>

      {/* Phase info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ color: '#E8EAF6', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 2px' }}>
            Day {currentDay} · <span style={{ color: '#38BDF8' }}>{phase}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.68rem', color: '#8B91B0', fontWeight: 500 }}>
            {daysToOvulation} days to Ovulation
          </span>
        </div>
      </div>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, justifyContent: 'space-between' }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 600,
              background: day === currentDay
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : '#0B0D14',
              color: day === currentDay ? 'white' : '#8B91B0',
              border: `1px solid ${day === currentDay ? '#10B981' : '#1E2133'}`,
              boxShadow: day === currentDay ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Phase legend */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(phaseColors).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <span style={{ color: '#8B91B0', fontSize: '0.62rem' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Today's logs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#8B91B0', fontSize: '0.72rem', fontWeight: 600 }}>Today&apos;s Logs</span>
          <button
            id="cycle-add-log-btn"
            style={{
              color: '#10B981', fontSize: '0.7rem', fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Add Log
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {logs.map(log => (
            <div
              key={log.label}
              id={`cycle-log-${log.label.toLowerCase()}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#0B0D14', border: '1px solid #1E2133',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  transition: 'background 0.15s ease',
                }}
              >
                {log.emoji}
              </div>
              <span style={{ color: '#8B91B0', fontSize: '0.6rem' }}>{log.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
