'use client';

import React from 'react';
import Link from 'next/link';
import { mockAppointments } from '@/lib/mock/dashboardData';

export default function AppointmentsCard() {
  return (
    <div className="fluetas-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="section-title">UPCOMING APPOINTMENTS</span>
        <button style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {mockAppointments.map(apt => (
          <div
            key={apt.id}
            id={`appointment-${apt.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px',
              background: '#0B0D14',
              borderRadius: 10,
              border: '1px solid #1E2133',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: apt.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white',
              }}
            >
              {apt.avatarInitials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#E8EAF6', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {apt.doctorName}
              </p>
              <p style={{ color: '#8B91B0', fontSize: '0.7rem', margin: '0 0 4px' }}>{apt.specialization}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#FBBF24', fontSize: '0.65rem' }}>★ {apt.rating}</span>
              </div>
            </div>

            {/* Date + status */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ color: '#E8EAF6', fontSize: '0.72rem', fontWeight: 500, margin: '0 0 2px' }}>{apt.dateLabel}</p>
              <p style={{ color: '#8B91B0', fontSize: '0.68rem', margin: '0 0 6px' }}>{apt.time}</p>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                {apt.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/consultations/book"
        id="book-consultation-btn"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '10px',
          borderRadius: 8,
          border: '1px dashed #2A3050',
          color: '#10B981',
          fontSize: '0.82rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background 0.15s ease, border-color 0.15s ease',
        }}
      >
        + Book New Consultation
      </Link>
    </div>
  );
}
