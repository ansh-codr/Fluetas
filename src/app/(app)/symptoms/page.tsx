'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  logSymptom,
  getRecentSymptoms,
  SymptomEntry,
  SymptomCategory,
  SeverityLevel,
  SYMPTOM_CATEGORIES,
} from '@/lib/services/symptomService';
import {
  Activity,
  Plus,
  X,
  TrendingUp,
  Loader2,
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
  const { user } = useAuth();
  const [logs, setLogs] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [symptomName, setSymptomName] = useState('');
  const [category, setCategory] = useState<SymptomCategory>('Musculoskeletal');
  const [severity, setSeverity] = useState<SeverityLevel>('Mild');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await getRecentSymptoms(user.uid, 50);
      setLogs(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const severityColorMap: Record<SeverityLevel, string> = {
    Mild: '#10B981',
    Moderate: '#F59E0B',
    Severe: '#EF4444',
  };

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !symptomName.trim()) return;
    setSubmitting(true);
    try {
      await logSymptom(user.uid, {
        symptom: symptomName,
        category,
        severity,
        notes: notes || undefined,
      });
      setModalOpen(false);
      setSymptomName('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute category breakdown for chart
  const categoryCounts: Record<string, number> = {};
  logs.forEach(l => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  const chartData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
  }));

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            SYMPTOM LOG &amp; BIOMETRIC PHENOTYPES
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
      {chartData.length > 0 && (
        <div className="fluetas-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#38BDF8]" />
              <span className="section-title">SYMPTOMS BY CATEGORY</span>
            </div>
            <span className="text-xs text-[#8B91B0]">{logs.length} total entries</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" horizontal={false} />
                <XAxis type="number" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Count" fill="#38BDF8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Symptom Log Stream */}
      <div className="flex flex-col gap-3">
        <span className="section-title">CHRONOLOGICAL LOGGED ENTRIES ({logs.length})</span>

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[#1E2133]/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="fluetas-card p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center mb-2">
              <Activity size={22} />
            </div>
            <p className="text-sm font-bold text-[#E8EAF6] m-0">No symptoms logged yet</p>
            <p className="text-xs text-[#8B91B0] m-0 mt-1 max-w-sm">
              Track joint fatigue, digestive discomfort, or energy dips to build a longitudinal clinical history.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Plus size={14} /> Log First Symptom
            </button>
          </div>
        ) : (
          logs.map(log => {
            const color = severityColorMap[log.severity] || '#10B981';
            return (
              <div
                key={log.id}
                className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2A3050] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                    style={{
                      backgroundColor: `${color}18`,
                      borderColor: `${color}40`,
                      color: color,
                    }}
                  >
                    <Activity size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0">
                        {log.symptom}
                      </h3>
                      <span
                        className="text-[0.65rem] font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${color}20`, color: color }}
                      >
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                      Category: {log.category} · {log.date}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-[#E8EAF6] m-0 mt-1.5 italic bg-[#0B0D14] p-2 rounded border border-[#1E2133]">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SymptomCategory)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                  >
                    {SYMPTOM_CATEGORIES.map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
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
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitting ? 'Saving...' : 'Save to Symptom History'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
