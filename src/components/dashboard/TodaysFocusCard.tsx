'use client';

import React from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import { mockTodaysFocus } from '@/lib/mock/dashboardData';

export default function TodaysFocusCard() {
  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="section-title">TODAY&apos;S FOCUS</span>
        <button style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mockTodaysFocus.map(item => (
          <div key={item.id} id={`focus-item-${item.id}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `${item.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                {item.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#E8EAF6', fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</span>
                  {item.done ? (
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#10B981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: 'white', fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span style={{ color: item.color, fontSize: '0.72rem', fontWeight: 600 }}>{item.progress}%</span>
                  )}
                </div>
                <p style={{ color: '#8B91B0', fontSize: '0.68rem', margin: '2px 0 0' }}>{item.detail}</p>
              </div>
            </div>
            {!item.done && (
              <ProgressBar value={item.progress} color={item.color} />
            )}
            {item.done && (
              <div style={{ height: 6, background: '#10B98120', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#10B981', borderRadius: 999 }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
