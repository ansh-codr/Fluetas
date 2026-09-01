'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';

export interface TimelineEventDoc {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  relatedId?: string;
  metadata?: Record<string, unknown>;
  timestamp: { seconds: number; nanoseconds: number };
}

interface UseTimelineResult {
  events: TimelineEventDoc[];
  loading: boolean;
  error: string | null;
}

export function useTimeline(count = 30): UseTimelineResult {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }

    const q = query(
      collection(db, 'users', user.uid, 'healthTimeline'),
      orderBy('timestamp', 'desc'),
      limit(count)
    );

    const unsub = onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEventDoc)));
      setLoading(false);
    }, () => {
      setError('Failed to load health timeline.');
      setLoading(false);
    });

    return () => unsub();
  }, [user, count]);

  return { events, loading, error };
}
