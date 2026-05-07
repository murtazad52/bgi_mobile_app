import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getSessionRequest, signInRequest, signOutRequest } from '@/lib/api/auth';
import type { LoginInput, SessionUser } from '@/lib/api/types';

type SessionContextValue = {
  session: SessionUser | null;
  isBooting: boolean;
  signIn: (payload: LoginInput) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSessionRequest()
      .then((response) => {
        if (!cancelled) {
          setSession(response.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBooting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(payload: LoginInput) {
    const response = await signInRequest(payload);
    setSession(response.user);
    return response.user;
  }

  async function signOut() {
    try {
      await signOutRequest();
    } finally {
      setSession(null);
    }
  }

  async function refreshSession() {
    const response = await getSessionRequest();
    setSession(response.user);
  }

  return (
    <SessionContext.Provider value={{ session, isBooting, signIn, signOut, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return value;
}
