'use client';

import React, { useState } from 'react';
import { mockSymptomLogs, mockSymptomFrequencies } from '@/lib/mock/dashboardData';
import {
  Activity,
  Plus,
  AlertCircle,
  TrendingUp,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SymptomsPage() {
  const [logs, setLogs] = useState(mockSymptomLogs);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [symptomName, setSymptomName] = useState('');
  const [category, setCategory] = useState('Musculoskeletal');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [notes, setNotes] = useState('');

  const severityColorMap = {
    Mild: '#10B981',
    Moderate: '#F59E0B',
    Severe: '#EF4444',
  };

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([
      {
        id: `sym-${Date.now()}`,
        date: 'Just now',
        symptom: symptomName || 'General Discomfort',
        category: category,
        severity: severity,
        severityColor: severityColorMap[severity],
        notes: notes || 'Logged by user.',
      },
      ...logs,
    ]);
    setModalOpen(false);
    setSymptomName('');
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            SYMPTOM LOG & CLINICAL PHENOTYPES
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Correlate aches, energy shifts, and digestive flare-ups with workout and nutrition data.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          Log New Symptom
        </button>
      </div>

      {/* Frequency Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#38BDF8]" />
            <span className="section-title">MOST FREQUENT SYMPTOMS (THIS MONTH)</span>
          </div>
          <span className="text-xs text-[#8B91B0]">Top Trigger: Post-Heavy Military Press</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSymptomFrequencies} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" horizontal={false} />
              <XAxis type="number" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="symptom" type="category" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="Frequency" fill="#38BDF8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptom Log Stream */}
      <div className="flex flex-col gap-3">
        <span className="section-title">CHRONOLOGICAL LOGGED ENTRIES ({logs.length})</span>

        {logs.map(log => (
          <div
            key={log.id}
            className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2A3050] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                style={{
                  backgroundColor: `${log.severityColor}18`,
                  borderColor: `${log.severityColor}40`,
                  color: log.severityColor,
                }}
              >
                <Activity size={18} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0">
                    {log.symptom}
                  </h3>
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${log.severityColor}20`, color: log.severityColor }}>
                    {log.severity}
                  </span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  Category: {log.category} · {log.date}
                </p>
                <p className="text-xs text-[#E8EAF6] m-0 mt-1.5 italic bg-[#0B0D14] p-2 rounded border border-[#1E2133]">
                  &quot;{log.notes}&quot;
                </p>
              </div>
            </div>

            <button
              onClick={() => alert(`Shared ${log.symptom} with consulting physician`)}
              className="text-xs text-[#38BDF8] hover:underline font-semibold self-end sm:self-auto shrink-0 cursor-pointer"
            >
              Share with Doctor →
            </button>
          </div>
        ))}
      </div>

      {/* Log Symptom Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B91B0] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Activity size={18} className="text-[#38BDF8]" />
              Log Current Symptom
            </h3>

            <form onSubmit={handleAddSymptom} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Symptom Description</label>
                <input
                  required
                  placeholder="e.g. Right shoulder impingement pinch"
                  value={symptomName}
                  onChange={e => setSymptomName(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  >
                    <option>Musculoskeletal</option>
                    <option>Digestive & Gut</option>
                    <option>Energy & Sleep</option>
                    <option>Hormonal / Cycle</option>
                    <option>Neurological / Head</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  >
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Trigger Context / Notes</label>
                <textarea
                  rows={3}
                  placeholder="What were you doing when this started? What relieved it?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2"
              >
                Save to Symptom History
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
