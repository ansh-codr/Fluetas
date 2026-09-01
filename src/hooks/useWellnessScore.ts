'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { calculateWellnessScore, WellnessScoreResult } from '@/lib/services/wellnessScoreService';

interface UseWellnessScoreResult {
  result: WellnessScoreResult | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useWellnessScore(): UseWellnessScoreResult {
  const { user } = useAuth();
  const [result, setResult] = useState<WellnessScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    calculateWellnessScore(user.uid)
      .then(r => { setResult(r); setLoading(false); })
      .catch(() => { setError('Could not calculate wellness score.'); setLoading(false); });
  }, [user, tick]);

  return { result, loading, error, reload: () => setTick(t => t + 1) };
}
