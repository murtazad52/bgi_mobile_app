import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

export const mobileConfig = {
  appName: 'Idara-Mohalla Attendance Mobile',
  networkHost: '62.215.143.149',
  apiBaseUrl: extra.apiBaseUrl ?? 'http://62.215.143.149/bgi_attendance_system',
};

export const mobileApiBaseUrl = `${mobileConfig.apiBaseUrl}/api/mobile`;
