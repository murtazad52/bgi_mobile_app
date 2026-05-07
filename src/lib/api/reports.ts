import { apiRequest } from '@/lib/api/client';
import type { ReportsOverviewResponse } from '@/lib/api/types';

export function getReportsOverview() {
  return apiRequest<ReportsOverviewResponse>('reports.php');
}
