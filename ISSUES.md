# WikTrack Development Issue Log

Last updated: 2026-05-15

This file records the important issues found during the Phase 1 build and how they were resolved. Phase 1 is complete; the remaining known friction is the email verification redirect behavior described below.

## Current Remaining Friction

### Email Verification Redirect
**Status:** Verification works, redirect UX needs polish

- **Observation:** Supabase email verification links verify the user successfully, but the link opens the backend/web URL instead of deep-linking back into the Android app.
- **Impact:** Users can verify, then must return to the app and log in again. Existing-account login works.
- **Next improvement:** Configure a mobile deep link or a clearer verification landing page that tells the user to return to WikTrack.

## Resolved Issues

### Background SMS Sync, Offline Cache, and Parser DLQ
**Status:** Resolved

- **Issue:** SMS sync only ran when the user opened the app, regex parser failures were invisible, and direct Supabase writes made weak-network sync brittle.
- **Fixes:** Added Android `SMS_RECEIVED` handling through Headless JS in the tracked `sms-reader` module, introduced Expo SQLite local transaction and failed-parse queues, moved foreground/onboarding/background sync through `smsSyncService`, and switched Dashboard/Transactions to local-first reads.
- **Database:** Added `failed_parses` to `supabase-schema.sql` and created `supabase-failed-parses-migration.sql` for existing projects. The user ran this migration in Supabase SQL Editor.
- **Result:** Parsed transactions appear immediately from local SQLite and upload silently when possible. Unrecognized MPESA messages are retained locally and uploaded to Supabase `failed_parses` for parser maintenance.
- **Verification:** `npx expo-doctor`, Android JS export, `:sms-reader:compileDebugKotlin`, `:app:compileDebugKotlin`, and `:app:assembleRelease` passed.

### Native SMS Reader and Import
**Status:** Resolved

- **Issue:** The app originally failed to load the native SMS reader in production builds, then later read `0` M-Pesa SMS on a phone that had an `MPESA` conversation.
- **Root causes:** Local Expo module linkage needed hardening, Android SMS providers did not always match strict sender-address queries, and sync checkpoints could skip historical messages after failed/empty attempts.
- **Fixes:** Imported the `sms-reader` package path, configured local-module autolinking, verified module naming, added strict-then-fallback inbox scanning, added full-history sync marker `@wiktrack_full_history_synced`, and exposed sync counts in Settings.
- **Result:** SMS reading and import now work on the real Android phone.

### SMS Parser Coverage and Date Handling
**Status:** Resolved

- **Issue:** Some income messages were not parsed, and parser date handling could fail under React Native/Hermes.
- **Fixes:** Added support for `Confirmed.You have received Ksh... from NAME masked-phone...` messages and manually constructed transaction timestamps instead of relying on loose string parsing.
- **Result:** Real M-Pesa income imports are working and dedupe uses SHA-256 `sms_hash`.

### Dashboard and Transaction Visibility
**Status:** Resolved

- **Issue:** Imported transactions could appear in Transactions but not immediately on Dashboard. Historical rows also looked like current-year rows because year labels were missing.
- **Fixes:** Home refreshes dashboard data when the tab regains focus, transaction rows/section headers include the year for prior-year records, Transactions has date filters, and Today's Income opens Transactions with the Today filter.
- **Result:** Dashboard and transaction history visibility are correct.

### Transactions Filter Layout
**Status:** Resolved

- **Issue:** Transaction filter chips looked squeezed on mobile.
- **Fix:** Reworked the filter area into wrapping rows, compact date chips, and improved chip tap/accessibility state.
- **Result:** Filters are cleaner and fit the mobile screen better.

### Returning-User Login
**Status:** Resolved

- **Issue:** Returning-user login crashed because it called a missing onboarding store action.
- **Fix:** Added/used the real onboarding store action.
- **Result:** Existing-account login works.

### Supabase Email Verification State
**Status:** Resolved with redirect caveat

- **Issue:** After clicking the email verification link, app session state could remain stale.
- **Fix:** Verification screen refreshes Supabase auth state, fetches the current user, avoids duplicate business rows, and blocks continuing without a business profile.
- **Result:** Verification works. Redirect still opens the backend/web URL, so users log in again after verifying.

### Local Android Release Build
**Status:** Resolved

- **Issue:** EAS cloud builds were too slow for fast APK testing.
- **Fix:** Used the generated local `WikTrack/android` Gradle project, local Android SDK path in ignored `android/local.properties`, JDK 17, and `:app:assembleRelease`.
- **Result:** Local release APK builds successfully at `WikTrack/android/app/build/outputs/apk/release/app-release.apk`.

### Expo TypeScript Dependency Check
**Status:** Resolved

- **Issue:** Expo/Metro complained about TypeScript files in `modules/sms-reader`.
- **Fix:** Installed Expo-compatible `typescript` and `@types/react`.
- **Result:** `npx expo-doctor` passes.

### Vercel Cron Authentication and Observability
**Status:** Resolved

- **Issue:** Cron failures were hard to diagnose and could silently hide Supabase or Expo push errors.
- **Fix:** Added explicit production `CRON_SECRET` validation, protected `?dryRun=1`, counters for eligible/skipped/sent/failed businesses, and per-business errors.
- **Result:** Cron logs now clearly show why a summary is or is not sent.

### Supabase Service Key in Vercel
**Status:** Resolved

- **Issue:** Vercel cron logged `Invalid API key`.
- **Root cause:** Vercel had an invalid or wrong Supabase key.
- **Fix:** Set Vercel Production env vars to the local backend values: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CRON_SECRET`, and `NODE_ENV=production`.
- **Result:** Backend can query Supabase in production.

### Push Token Missing
**Status:** Resolved

- **Issue:** Cron returned `eligibleBusinesses: 0` even though the business had transactions.
- **Root cause:** The business had `notifications: true` but `push_token: null`.
- **Fix:** Settings now loads notification status from Supabase, shows whether the phone is registered, and provides explicit Register/Refresh actions. Registration errors are shown to the user instead of only logged.
- **Result:** The phone saves a push token and cron sees `eligibleBusinesses: 1`.

### Firebase Android Initialization
**Status:** Resolved

- **Issue:** Phone registration failed with `Default FirebaseApp is not initialized`.
- **Root cause:** Android APK did not include Firebase Android config.
- **Fix:** Added `WikTrack/google-services.json` for package `com.wiktrack.app`, configured `android.googleServicesFile` in `app.json`, and wired the local generated Android project with the Google Services Gradle plugin for local APK builds.
- **Result:** Android can initialize Firebase/FCM and obtain an Expo push token.

### Expo FCM V1 Credential
**Status:** Resolved

- **Issue:** Expo rejected push sends with `Unable to retrieve the FCM server key for the recipient's app`.
- **Root cause:** Expo/EAS did not have the Firebase FCM V1 service account key assigned to `com.wiktrack.app`.
- **Fix:** Uploaded the Firebase service account key through `eas credentials -p android` using the FCM V1 setup option.
- **Result:** Vercel cron sent the daily summary notification successfully.
- **Security note:** The first Firebase service-account private key was exposed in chat during testing. Rotate/delete that key in Firebase and upload the replacement to Expo/EAS after testing.

### Backend/App Relationship
**Status:** Clarified

- **Issue:** It was unclear whether the Android app needed to call the backend directly.
- **Finding:** The app intentionally talks directly to Supabase for auth, settings, transactions, dashboard data, and SMS sync. The backend is required for scheduled server-side notifications only.
- **Result:** Architecture remains direct-to-Supabase for the app and Vercel-backed for daily summary notifications.

### Removed Product Scope
**Status:** Resolved

- The app is free. Subscription/trial/payment-plan logic is not part of Phase 1.

## Verification Summary

- Real-phone SMS sync: working.
- Existing-account login: working.
- Supabase email verification: working, with redirect UX caveat.
- Local APK build: working.
- Vercel backend health: working.
- Vercel Cron auth: working.
- FCM V1 notification delivery: working.
