import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

export const mobileConfig = {
  appName: 'Idara-Mohalla Attendance Mobile',
  networkHost: '100.96.1.18',
  apiBaseUrl: extra.apiBaseUrl ?? 'http://100.96.1.18/bgi_attendance_system',
};

export const mobileApiBaseUrl = `${mobileConfig.apiBaseUrl}/api/mobile`;
