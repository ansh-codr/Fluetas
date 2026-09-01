'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './AuthContext';
import {
  UserProfile,
  HealthProfile,
  calculateProfileCompleteness,
  getUserProfile,
  getHealthProfile,
} from '@/lib/services/userService';

interface UserProfileContextValue {
  profile: UserProfile | null;
  healthProfile: HealthProfile | null;
  completeness: { pct: number; completed: string[]; remaining: string[] };
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: null,
  healthProfile: null,
  completeness: { pct: 0, completed: [], remaining: [] },
  loading: true,
  refresh: async () => {},
});

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const completeness = calculateProfileCompleteness(profile, healthProfile);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setHealthProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener on user document
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) {
        setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
    });

    // Real-time listener on health profile
    const unsubHealth = onSnapshot(
      doc(db, 'users', user.uid, 'healthProfile', 'main'),
      snap => {
        setHealthProfile(snap.exists() ? (snap.data() as HealthProfile) : null);
        setLoading(false);
      }
    );

    return () => {
      unsubUser();
      unsubHealth();
    };
  }, [user]);

  const refresh = async () => {
    if (!user) return;
    const [p, hp] = await Promise.all([
      getUserProfile(user.uid),
      getHealthProfile(user.uid),
    ]);
    setProfile(p);
    setHealthProfile(hp);
  };

  return (
    <UserProfileContext.Provider value={{ profile, healthProfile, completeness, loading, refresh }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
