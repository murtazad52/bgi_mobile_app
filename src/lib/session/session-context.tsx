import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  changePasswordRequest,
  getSessionRequest,
  signInRequest,
  signOutRequest,
  verifyTwoFactorRequest,
} from '@/lib/api/auth';
import type { LoginInput, LoginResponse, SessionUser } from '@/lib/api/types';

type SessionContextValue = {
  session: SessionUser | null;
  isBooting: boolean;
  signIn: (payload: LoginInput) => Promise<LoginResponse>;
  verifyTwoFactor: (code: string) => Promise<SessionUser>;
  changePassword: (newPassword: string, confirmPassword: string) => Promise<SessionUser>;
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

  async function signIn(payload: LoginInput): Promise<LoginResponse> {
    const response = await signInRequest(payload);
    // A 2FA-required response has no user yet — keep the session unset.
    if (!('requires2fa' in response)) {
      setSession(response.user);
    }
    return response;
  }

  async function verifyTwoFactor(code: string) {
    const response = await verifyTwoFactorRequest(code);
    setSession(response.user);
    return response.user;
  }

  async function changePassword(newPassword: string, confirmPassword: string) {
    const response = await changePasswordRequest(newPassword, confirmPassword);
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
    <SessionContext.Provider
      value={{ session, isBooting, signIn, verifyTwoFactor, changePassword, signOut, refreshSession }}>
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
