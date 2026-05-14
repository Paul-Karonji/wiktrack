# WikTrack Mobile App

Expo React Native Android app for free M-Pesa income tracking.

## Current State

- Phase 1 app build is complete.
- Existing-account login works.
- Supabase email verification works, but verification links currently open the backend URL; users log in again after verifying.
- Native SMS reading and import work on Android.
- Dashboard, Transactions, Settings, and daily summary notifications work.
- The app stores push tokens in Supabase so the Vercel backend can send 8:00 PM EAT summaries.

## Important Files

```text
App.js                         Navigation root
app.json                       Expo app config
google-services.json           Firebase Android config for com.wiktrack.app
eas.json                       EAS build profiles
modules/sms-reader/            Local Expo SMS reader module
src/hooks/useSmsSync.js        Permission, SMS read, parse, upsert flow
src/hooks/useDashboard.js      Dashboard Supabase reads
src/hooks/useTransactions.js   Transaction list/filter reads
src/lib/notifications.js       Expo push token registration
src/lib/smsParser.js           M-Pesa SMS parser
src/lib/smsReader.js           Native SMS reader wrapper
src/screens/SettingsScreen.js  Sync controls and notification registration status
src/screens/TransactionsScreen.js Search, type filters, date filters
src/store/index.js             Persisted business/session state
```

## Setup

```bash
npm install
npx expo-doctor
```

Run Metro:

```bash
npm run start
```

## Local Release APK

The generated `android/` folder is ignored by git but exists locally for fast APK builds.

```powershell
cd "C:\Users\paul\Documents\Wik\Wik track\WikTrack\android"
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:NODE_ENV="production"
.\gradlew.bat :app:assembleRelease
```

APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Install when a phone is connected:

```powershell
C:\Users\paul\AppData\Local\Android\Sdk\platform-tools\adb.exe install -r "C:\Users\paul\Documents\Wik\Wik track\WikTrack\android\app\build\outputs\apk\release\app-release.apk"
```

## Push Notifications

For Android notification tokens to work:

1. `google-services.json` must exist at the app root and match package `com.wiktrack.app`.
2. `app.json` must include:

```json
"android": {
  "package": "com.wiktrack.app",
  "googleServicesFile": "./google-services.json"
}
```

3. Expo/EAS credentials must have the Firebase FCM V1 service account key assigned to `com.wiktrack.app`.
4. The user logs in, opens Settings, and uses the phone registration row if the token is missing.

The Firebase service-account private key must never be committed. Rotate it after testing because the first key was exposed in chat.

## Notes

- The app talks directly to Supabase for auth, transaction data, settings, and SMS imports.
- The backend is not an app data proxy. It is used for Vercel Cron and push notifications.
- The app is free. There is no subscription/trial flow.
