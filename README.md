# Idara-Mohalla Attendance Mobile

Phase 1 currently includes only:

- `Dashboard`
- `Record Attendance`

## Backend target

The mobile app is configured to call:

```text
http://100.96.1.18/bgi_attendance_system
```

The PHP mobile API lives under:

```text
/api/mobile/
```

Implemented endpoints:

- `login.php`
- `me.php`
- `logout.php`
- `dashboard.php`
- `attendance.php`

## Run the app

```bash
npm install
npx expo start
```

## Android build setup

This project is prepared for Expo EAS Android builds with:

- `development`: development client APK
- `preview-apk`: installable release APK
- `production`: Play Store AAB

Build commands:

```bash
npm run build:android:dev
npm run build:android:apk
npm run build:android:store
```

Android application id:

```text
com.idaramohalla.attendance
```

Before your first cloud build, sign in and configure EAS:

```bash
npx eas login
```

## Main mobile routes

- `src/app/login.tsx`
- `src/app/(tabs)/dashboard.tsx`
- `src/app/(tabs)/attendance.tsx`

## Notes

- Android cleartext traffic is enabled because the current server uses `http://100.96.1.18`.
- For production, move the backend to `https`.
- Mobile access follows the same existing PHP roles, Idara, and Mohalla rules.
