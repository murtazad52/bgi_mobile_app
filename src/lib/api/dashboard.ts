import { apiRequest } from '@/lib/api/client';
import type { DashboardResponse } from '@/lib/api/types';

export function getDashboard() {
  return apiRequest<DashboardResponse>('dashboard.php');
}
