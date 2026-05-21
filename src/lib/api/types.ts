export type UserRole =
  | 'super_admin'
  | 'idara_admin'
  | 'mohalla_admin'
  | 'idara_attendance_admin'
  | 'member';

export type MemberPosition = 'member' | 'team_leader' | 'captain';
export type ReportMode = 'staff' | 'self' | 'team' | 'scope';
export type MetricTone = 'pine' | 'gold' | 'danger' | 'success' | 'neutral' | 'late' | 'kuwait';

export interface SessionUser {
  username: string;
  role: UserRole;
  roleLabel: string;
  scopeLabel: string;
  idara: string;
  mohalla: string;
  memberPosition: MemberPosition | null;
  reportMode: ReportMode;
  canTakeAttendance: boolean;
  canViewReports: boolean;
  homePath: string;
  mustChangePassword?: boolean;
}

export interface LoginInput {
  loginType: 'admin' | 'member';
  identifier: string;
  secret: string;
}

export interface SessionResponse {
  ok: true;
  user: SessionUser;
}

export interface LoginSuccessResponse {
  ok: true;
  user: SessionUser;
  mustChangePassword?: boolean;
}

export interface TwoFactorRequiredResponse {
  ok: true;
  requires2fa: true;
  message?: string;
}

export type LoginResponse = LoginSuccessResponse | TwoFactorRequiredResponse;

export interface ChangePasswordResponse {
  ok: true;
  message: string;
  user: SessionUser;
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  subtitle?: string;
  tone: MetricTone;
}

export interface EventPreview {
  id: number;
  eventName: string;
  eventCode: string;
  eventDate: string;
  reportingTime: string;
  idara: string;
  mohalla: string;
  recordedCount?: number;
  userStatus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
}

export interface DashboardResponse {
  ok: true;
  user: SessionUser;
  metrics: DashboardMetric[];
  recentEvents: EventPreview[];
  notices: string[];
}

export interface AttendanceOptionsResponse {
  ok: true;
  user: SessionUser;
  allowedStatuses: string[];
  events: EventPreview[];
}

export interface RecordAttendanceInput {
  eventId: number;
  itsId: string;
  status: string;
  remark: string;
  lat?: number;
  lng?: number;
}

export interface AttendanceRecordResponse {
  ok: true;
  message: string;
  recordedStatus: string;
  eventName: string;
  memberName: string;
  isRemote?: boolean;
  distanceMeters?: number | null;
}

export interface CheckinOptionsResponse {
  ok: true;
  user: SessionUser;
  events: EventPreview[];
}

export interface CheckinInput {
  eventId: number;
  lat?: number;
  lng?: number;
}

export interface CheckinResponse {
  ok: true;
  message: string;
  recordedStatus: string;
  eventName: string;
  isRemote: boolean;
  distanceMeters: number | null;
}

export interface ReportsSummary {
  records: number;
  present: number;
  late: number;
  absent: number;
  outOfKuwait: number;
}

export interface ReportEntry {
  id: number;
  eventName: string;
  eventCode: string;
  eventDate: string;
  reportingTime: string;
  totalRecords?: number;
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
  outOfKuwaitCount?: number;
  userStatus?: string | null;
  attendanceTime?: string | null;
}

export interface ReportsOverviewResponse {
  ok: true;
  user: SessionUser;
  summary: ReportsSummary;
  latestEntries: ReportEntry[];
  modeLabel: string;
}
