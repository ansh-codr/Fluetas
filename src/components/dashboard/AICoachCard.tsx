'use client';

import React from 'react';
import Link from 'next/link';
import { mockAIInsight } from '@/lib/mock/dashboardData';

export default function AICoachCard() {
  return (
    <div
      className="fluetas-card"
      style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #13161F, #1a1030)',
        borderColor: 'rgba(167, 139, 250, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="section-title">AI COACH INSIGHT</span>
        <Link href="/ai-coach" style={{ color: '#A78BFA', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
          Ask AI &gt;
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {/* Bot avatar */}
        <div
          style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
          }}
        >
          🤖
        </div>
        <div>
          <p style={{ color: '#E8EAF6', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>
            {mockAIInsight.text}
          </p>
        </div>
      </div>

      <Link
        href="/ai-coach"
        id="ai-coach-chat-btn"
        className="btn-primary"
        style={{
          width: '100%', justifyContent: 'center', textDecoration: 'none',
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
        }}
      >
        🤖 Talk to FLUETAS AI Coach
      </Link>
    </div>
  );
}
