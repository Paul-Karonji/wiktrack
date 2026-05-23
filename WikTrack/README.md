# WikTrack Mobile App

Expo React Native Android app for advanced M-Pesa Income and Expense tracking.

## Current State

- **Dual-Flow Ledger**: Fully supports both **Income** (received money) and **Expenses** (sent money) in a unified, modern interface.
- **Strictly M-Pesa Network**: Engineered specifically for M-Pesa. Strips direct Airtel SIM monitoring while seamlessly handling cross-network Airtel-to-Mpesa deposits arriving via `MPESA`.
- **Fuliza Overdraft Support**: Detects and parses Fuliza overdraft SMS events to track transaction shortfalls, outstanding debt, and automatic repayments, logging overdraft access fees as individual expenses.
- **Custom Recipient Mappings**: Integrated modal allows assigning friendly custom names and categories (e.g., Food, Travel) to recipients, which cache instantly in SQLite and sync to Supabase.
- **SQLite Sync Database Lock Fix**: Pending queues (transactions, failed parses, recipient mappings) are flushed sequentially during remote Supabase sync, eliminating concurrent exclusive transaction blocks.
- Dashboard with side-by-side Income/Expense cards and weekly trend flow segmentation.
- Native SMS reading, history importing, and background Headless JS receiver for Android.
- User accounts and email login synced with Supabase.
- Dead-letter upload system (uploads unrecognized M-Pesa SMS lines to `failed_parses`).

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
-> smsSyncService parses the M-Pesa message (income / expense / Fuliza)
-> parsed transactions are saved to local Expo SQLite
-> unrecognized MPESA messages are placed in local failed-parse queue
-> pending transactions are sequentially uploaded to Supabase
-> pending parser failures are sequentially uploaded to Supabase failed_parses
-> pending custom recipient mappings are sequentially uploaded to Supabase
-> dashboard, transactions list, and details read SQLite first (local-first)
```

The app asks for both `READ_SMS` and `RECEIVE_SMS`. `READ_SMS` supports full-history/manual sync; `RECEIVE_SMS` supports the Android background receiver.

SMS hashes are generated through `src/lib/hash.js`. It tries Expo Crypto first, then falls back to a pure-JS SHA-256 implementation so background Headless JS sync can keep deduping safely even if the native crypto module is unavailable.

## Supabase Schema

The `failed_parses` table is required for parser dead-letter uploads. It is included in the root `supabase-schema.sql`. For an existing Supabase project, run the root `supabase-failed-parses-migration.sql` once in Supabase SQL Editor.

The user has already run this migration. An empty `failed_parses` table is normal when all MPESA messages parse successfully.

## Manual Test Checklist

```text
1. Install the latest release APK (android/app/build/outputs/apk/release/app-release.apk).
2. Log in with your Supabase credentials.
3. Grant SMS read and receive permissions when prompted.
4. Go to Settings -> Sync to import existing M-Pesa history.
5. Verify Income and Expenses split on the Home Dashboard and Transactions screen.
6. Tap any transaction -> Assign custom name / category, save, and verify mapping sync.
7. Perform an M-Pesa transaction using Fuliza and verify shortfall/outstanding debt tracking.
8. Check Supabase 'transactions', 'failed_parses', and 'recipient_mappings' tables for synced rows.
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
