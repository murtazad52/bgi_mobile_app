import { apiRequest } from '@/lib/api/client';
import type {
  ChangePasswordResponse,
  LoginInput,
  LoginResponse,
  SessionResponse,
} from '@/lib/api/types';

export function signInRequest(payload: LoginInput) {
  return apiRequest<LoginResponse>('login.php', {
    method: 'POST',
    body: payload,
  });
}

export function verifyTwoFactorRequest(code: string) {
  return apiRequest<SessionResponse>('verify_2fa.php', {
    method: 'POST',
    body: { code },
  });
}

export function changePasswordRequest(newPassword: string, confirmPassword: string) {
  return apiRequest<ChangePasswordResponse>('change_password.php', {
    method: 'POST',
    body: { newPassword, confirmPassword },
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
