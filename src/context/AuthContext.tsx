'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, IdTokenResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export type UserRole = 'customer' | 'doctor' | 'admin' | null;
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deactivated';

export interface UserAccountData {
  userId: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  doctorId?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  status: AccountStatus;
  loading: boolean;
  refreshUserRole: () => Promise<void>;
  setDevRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  status: 'active',
  loading: true,
  refreshUserRole: async () => {},
  setDevRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [status, setStatus] = useState<AccountStatus>('active');
  const [loading, setLoading] = useState(true);

  // Authoritatively resolve user role and status from verified custom claims or Firestore
  const resolveUserAuthorization = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setRole(null);
      setStatus('active');
      return;
    }

    try {
      // 1. Check Custom Claims on verified Firebase ID Token
      const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
      const claimRole = tokenResult.claims.role as UserRole | undefined;

      if (claimRole && ['customer', 'doctor', 'admin'].includes(claimRole)) {
        setRole(claimRole);
        setStatus((tokenResult.claims.status as AccountStatus) || 'active');
        return;
      }

      // 2. Fallback to read-only Firestore user document
      if (db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          setRole((data.role as UserRole) || 'customer');
          setStatus((data.status as AccountStatus) || 'active');
          return;
        }
      }

      setRole('customer');
      setStatus('active');
    } catch (err) {
      console.warn('[AuthContext] Role resolution warning:', err);
      setRole('customer');
      setStatus('active');
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await resolveUserAuthorization(firebaseUser);
      } else {
        setRole(null);
        setStatus('active');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolveUserAuthorization]);

  // Forces Firebase token refresh after server-side role changes
  const refreshUserRole = async () => {
    if (!user) return;
    try {
      await user.getIdToken(true); // force refresh token
      await resolveUserAuthorization(user);
    } catch (err) {
      console.warn('[AuthContext] refreshUserRole error:', err);
    }
  };

  // Development-only mock persona switcher (UI preview only, never writes to DB or grants real backend claims)
  const setDevRole = async (newRole: UserRole) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[AuthContext] Persona switching is disabled in production.');
      return;
    }
    setRole(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, status, loading, refreshUserRole, setDevRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
