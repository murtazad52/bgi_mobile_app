import { apiRequest } from '@/lib/api/client';
import type {
  AttendanceOptionsResponse,
  AttendanceRecordResponse,
  RecordAttendanceInput,
} from '@/lib/api/types';

export function getAttendanceOptions() {
  return apiRequest<AttendanceOptionsResponse>('attendance.php');
}

export function recordAttendance(payload: RecordAttendanceInput) {
  return apiRequest<AttendanceRecordResponse>('attendance.php', {
    method: 'POST',
    body: payload,
  });
}
