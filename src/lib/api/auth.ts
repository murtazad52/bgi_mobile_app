import { apiRequest } from '@/lib/api/client';
import type { LoginInput, SessionResponse } from '@/lib/api/types';

export function signInRequest(payload: LoginInput) {
  return apiRequest<SessionResponse>('login.php', {
    method: 'POST',
    body: payload,
  });
}

export function getSessionRequest() {
  return apiRequest<SessionResponse>('me.php');
}

export function signOutRequest() {
  return apiRequest<{ ok: true; message: string }>('logout.php', {
    method: 'POST',
  });
}
