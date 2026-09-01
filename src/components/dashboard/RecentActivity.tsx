'use client';

import React from 'react';
import Link from 'next/link';
import { mockRecentActivity } from '@/lib/mock/dashboardData';

const typeColors: Record<string, string> = {
  workout:   '#10B981',
  hydration: '#38BDF8',
  nutrition: '#22C55E',
  sleep:     '#A78BFA',
};

export default function RecentActivity() {
  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="section-title">RECENT ACTIVITY</span>
        <button style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mockRecentActivity.map(item => {
          const color = typeColors[item.type] ?? '#10B981';
          return (
            <div
              key={item.id}
              id={`activity-${item.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                {item.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#E8EAF6', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </p>
                <p style={{ color: '#8B91B0', fontSize: '0.68rem', margin: 0 }}>{item.detail}</p>
              </div>
              <p style={{ color: '#3A3F58', fontSize: '0.65rem', flexShrink: 0, textAlign: 'right', margin: 0 }}>
                {item.time}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
