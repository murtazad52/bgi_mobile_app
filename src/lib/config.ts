import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

export const mobileConfig = {
  appName: 'Idara-Mohalla Attendance Mobile',
  networkHost: 'badriattendance.duckdns.org',
  apiBaseUrl: extra.apiBaseUrl ?? 'https://badriattendance.duckdns.org/bgi_attendance_system',
};

export const mobileApiBaseUrl = `${mobileConfig.apiBaseUrl}/api/mobile`;
