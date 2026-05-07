import { apiRequest } from '@/lib/api/client';
import type { CheckinInput, CheckinOptionsResponse, CheckinResponse } from '@/lib/api/types';

export function getCheckinOptions() {
  return apiRequest<CheckinOptionsResponse>('checkin.php');
}

export function submitCheckin(payload: CheckinInput) {
  return apiRequest<CheckinResponse>('checkin.php', {
    method: 'POST',
    body: payload,
  });
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}
