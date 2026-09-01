'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, orderBy, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';

export interface NotificationDoc {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  read: boolean;
  createdAt: { seconds: number; nanoseconds: number };
}

interface UseNotificationsResult {
  notifications: NotificationDoc[];
  unreadCount: number;
  loading: boolean;
  markRead: (notifId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }

    const q = query(
      collection(db, 'notifications', user.uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback(async (notifId: string) => {
    const firestore = db;
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, 'notifications', user.uid, 'items', notifId), {
      read: true,
      readAt: Timestamp.now(),
    });
  }, [user]);

  const markAllRead = useCallback(async () => {
    const firestore = db;
    if (!user || !firestore) return;
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n =>
        updateDoc(doc(firestore, 'notifications', user.uid, 'items', n.id), {
          read: true,
          readAt: Timestamp.now(),
        })
      )
    );
  }, [user, notifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
