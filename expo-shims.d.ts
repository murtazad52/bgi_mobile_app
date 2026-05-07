declare module '*.module.css';

declare module 'expo-constants' {
  const Constants: {
    expoConfig?: {
      extra?: Record<string, unknown>;
    };
  };

  export default Constants;
}

declare module 'expo-web-browser';
