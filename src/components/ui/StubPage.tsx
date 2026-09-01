import React from 'react';
import Link from 'next/link';

interface StubPageProps {
  title: string;
  emoji: string;
  description: string;
  phase?: string;
}

export default function StubPage({ title, emoji, description, phase = 'Phase 2' }: StubPageProps) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
          border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, marginBottom: 20,
        }}
      >
        {emoji}
      </div>

      <h1
        style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem',
          color: '#E8EAF6', margin: '0 0 8px',
        }}
      >
        {title}
      </h1>
      <p style={{ color: '#8B91B0', fontSize: '0.9rem', margin: '0 0 24px', maxWidth: 400, lineHeight: 1.6 }}>
        {description}
      </p>

      <div
        style={{
          padding: '8px 16px', borderRadius: 999,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#10B981', fontSize: '0.8rem', fontWeight: 600,
          marginBottom: 24,
        }}
      >
        🚧 Coming in {phase}
      </div>

      <Link
        href="/dashboard"
        className="btn-primary"
        style={{ textDecoration: 'none' }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
