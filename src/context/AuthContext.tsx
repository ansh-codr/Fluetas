'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export type UserRole = 'customer' | 'doctor' | 'admin' | null;
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deactivated';

export interface UserAccountData {
  userId: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  doctorId?: string; // Links doctor account to doctor document
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  status: AccountStatus;
  loading: boolean;
  setDevRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  status: 'active',
  loading: true,
  setDevRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [status, setStatus] = useState<AccountStatus>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When Firebase is not configured, skip auth listener
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Check local dev role override in sessionStorage if present
          const devRoleOverride = typeof window !== 'undefined' ? sessionStorage.getItem(`dev_role_${firebaseUser.uid}`) as UserRole : null;

          if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              const data = snap.data();
              setRole(devRoleOverride || (data.role as UserRole) || 'customer');
              setStatus((data.status as AccountStatus) || 'active');
            } else {
              setRole(devRoleOverride || 'customer');
              setStatus('active');
            }
          } else {
            setRole(devRoleOverride || 'customer');
            setStatus('active');
          }
        } catch (err) {
          console.warn('[AuthContext] Role resolution error:', err);
          setRole('customer');
          setStatus('active');
        }
      } else {
        setRole(null);
        setStatus('active');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setDevRole = async (newRole: UserRole) => {
    if (!user) return;
    setRole(newRole);
    if (typeof window !== 'undefined') {
      if (newRole) {
        sessionStorage.setItem(`dev_role_${user.uid}`, newRole);
      } else {
        sessionStorage.removeItem(`dev_role_${user.uid}`);
      }
    }
    if (db) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          role: newRole || 'customer',
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, status, loading, setDevRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
