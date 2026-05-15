# WikTrack Mobile App

Expo React Native Android app for free M-Pesa income tracking.

## Current State

- Phase 1 app build is complete.
- Existing-account login works.
- Supabase email verification works, but verification links currently open the backend URL; users log in again after verifying.
- Native SMS reading and import work on Android.
- Background SMS receive sync is wired through Android Headless JS in the local SMS module.
- Transactions are written to Expo SQLite first, then uploaded to Supabase when online.
- MPESA messages that no parser recognizes are uploaded to the `failed_parses` dead-letter table.
- Dashboard, Transactions, Settings, and daily summary notifications work.
- The app stores push tokens in Supabase so the Vercel backend can send 8:00 PM EAT summaries.

## Important Files

```text
App.js                         Navigation root
app.json                       Expo app config
google-services.json           Firebase Android config for com.wiktrack.app
eas.json                       EAS build profiles
modules/sms-reader/            Local Expo SMS reader module
modules/sms-reader/android/src/main/java/expo/modules/smsreader/SmsBroadcastReceiver.kt
                               Android SMS_RECEIVED receiver
modules/sms-reader/android/src/main/java/expo/modules/smsreader/SmsHeadlessTaskService.kt
                               Starts the JS background task
src/hooks/useSmsSync.js        Permission and foreground sync trigger
src/hooks/useDashboard.js      Local-first dashboard reads
src/hooks/useTransactions.js   Local-first transaction list/filter reads
src/lib/notifications.js       Expo push token registration
src/lib/localDatabase.js       SQLite cache and pending sync queue
src/lib/smsSyncService.js      Shared parse, queue, Supabase sync, DLQ flow
src/lib/smsParser.js           M-Pesa SMS parser
src/lib/smsReader.js           Native SMS reader wrapper
src/tasks/smsReceivedTask.js   Headless JS task registration target
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

## SMS Sync Architecture

```text
Manual sync or incoming SMS
-> smsSyncService parses the message
-> parsed transactions are saved to Expo SQLite immediately
-> unrecognized MPESA messages are saved to the local failed-parse queue
-> pending transactions upload to Supabase transactions
-> pending parser failures upload to Supabase failed_parses
-> dashboard and transaction screens read SQLite first
```

The app asks for both `READ_SMS` and `RECEIVE_SMS`. `READ_SMS` supports full-history/manual sync; `RECEIVE_SMS` supports the Android background receiver.

SMS hashes are generated through `src/lib/hash.js`. It tries Expo Crypto first, then falls back to a pure-JS SHA-256 implementation so background Headless JS sync can keep deduping safely even if the native crypto module is unavailable.

## Supabase Schema

The `failed_parses` table is required for parser dead-letter uploads. It is included in the root `supabase-schema.sql`. For an existing Supabase project, run the root `supabase-failed-parses-migration.sql` once in Supabase SQL Editor.

The user has already run this migration. An empty `failed_parses` table is normal when all MPESA messages parse successfully.

## Manual Test Checklist

```text
1. Install the latest release APK.
2. Log in.
3. Grant SMS permissions.
4. Settings -> Sync now imports existing MPESA income.
5. Dashboard and Transactions should populate from local SQLite.
6. Send/receive a new MPESA income SMS and confirm it appears after background sync.
7. Check Supabase transactions for uploaded rows.
8. Check Supabase failed_parses only if a parser format looks broken.
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

- The app talks directly to Supabase for auth and settings; transaction reads are local-first with Supabase sync in the background.
- The latest release APK is at `android/app/build/outputs/apk/release/app-release.apk`.
- The backend is not an app data proxy. It is used for Vercel Cron and push notifications.
- The app is free. There is no subscription/trial flow.
