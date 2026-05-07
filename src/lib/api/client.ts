import { mobileApiBaseUrl } from '@/lib/config';

const REQUEST_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${mobileApiBaseUrl}/${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'The mobile app could not reach the server in time. Check that 100.96.1.18 is reachable on the same network.',
        0
      );
    }

    throw new ApiError(
      'The mobile app could not connect to the server. Check that 100.96.1.18 is reachable and HTTP access is allowed on the device.',
      0,
      error
    );
  }

  clearTimeout(timeoutId);

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    throw new ApiError(
      `Too many requests. Please wait ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''} before trying again.`,
      429,
      payload
    );
  }

  if (!response.ok || (payload && typeof payload === 'object' && payload.ok === false)) {
    throw new ApiError(
      readErrorMessage(payload) ?? `Request failed with status ${response.status}.`,
      response.status,
      payload
    );
  }

  return payload as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, message: text };
  }
}

function readErrorMessage(payload: Record<string, unknown> | null) {
  const message = payload?.message;
  return typeof message === 'string' && message.trim() !== '' ? message : null;
}
