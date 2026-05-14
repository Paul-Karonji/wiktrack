# WikTrack Development Issue Log

This document records the technical challenges, bugs, and resolutions encountered during the finalization of the WikTrack production build.

## Current Fix Pass - 2026-05-14
- Dashboard and transaction history visibility was tightened:
  - Dashboard now refetches when Home regains focus, fixing the stale state where parsed/imported transactions were visible on the Transactions page but not after returning to Dashboard.
  - Transactions now has visible date filter chips for All time, Today, 7 days, This month, and year filters for the current plus two previous years.
  - Transactions filter buttons were visually cleaned up after a mobile screenshot showed the rows looking squeezed: type filters now wrap into a responsive grid and date filters use compact wrapping chips.
  - Tapping Today's Income on Dashboard applies the Today filter on Transactions and clears the navigation flag after applying it.
  - Historical transaction group headers and row timestamps now include the year for prior-year records, e.g. `Apr 16, 2024`.
  - Recent Payments empty state copy no longer says "today" because that list shows the latest transactions overall.
- Native SMS loading was hardened by importing the `sms-reader` package path, explicitly declaring `expo.autolinking.nativeModulesDir`, and confirming local Android autolinking resolves `expo.modules.smsreader.SmsReaderModule`.
- Email verification now refreshes the Supabase session, fetches the current user, avoids duplicate business rows, and blocks continuing without a business profile.
- Returning-user login now uses the real onboarding store action and no longer calls the missing `setOnboardingComplete` method.
- Vercel Cron now runs at `0 17 * * *`, which is 8:00 PM EAT, and backend daily summaries use Nairobi day boundaries.
- Debug SMS alerts were removed from production sync; Settings "Sync now" now triggers a real sync.

## Current Issue - Local Expo Metro TypeScript Dependency Check
**Status:** Environment/dependency note, not an app architecture change
- **Observation:** Running local `npm run start -- --port 8081` reached Expo/Metro, then Expo stopped with a message asking to install `typescript@~5.9.2` and `@types/react@~19.1.10`.
- **Cause:** The app is still using Expo. Expo detects TypeScript files in the local SMS module (`modules/sms-reader`) and requires the TypeScript helper packages for local Metro startup.
- **Resolution:** Install the packages with `npx expo install typescript @types/react` if local `expo start` is blocked. No package changes were made during the filter UI pass.

## Current Issue - Sync Scope After Native Module Fix
**Status:** Fix applied / needs new APK confirmation
- **Observation:** After the native module started working, the app appeared to scan only recent/today messages.
- **Cause:** This is checkpoint behavior, not necessarily parser failure. `FirstSyncScreen` scans all SMS history with `minDate: 0`, but Home/Settings sync uses the persisted `@wiktrack_last_sync` timestamp. Earlier failed or empty sync attempts could write this timestamp before a successful historical import.
- **Fix:** Added a separate `@wiktrack_full_history_synced` marker. Until full history is marked complete, the next sync scans all history even if `@wiktrack_last_sync` exists. Settings sync now reports how many MPESA SMS were read and how many payments parsed/imported.
- **Parser verification:** If Settings reports SMS read > 0 but payments imported = 0, the native reader is working and the remaining issue is parser coverage or message type selection. If SMS read = 0, the issue is sender filtering, SMS permission, or there are no matching inbox messages from MPESA/M-PESA.

## Current Issue - Android SMS Address Query Returned 0
**Status:** Fix applied / needs new APK confirmation
- **Observation:** Settings showed "Read 0 M-Pesa SMS" even though the phone's Messages app showed an `MPESA` conversation.
- **Cause:** Parser was not reached. The native Android query was filtering by sender address (`address = MPESA` / `M-PESA` / `LIKE %MPESA%`). Some Android SMS providers can display a sender as `MPESA` in the UI while not matching that exact content-provider address selection.
- **Fix:** Native reader now tries the strict sender-address query first, then falls back to scanning inbox rows by date and immediately keeping only rows whose sender/body look like M-Pesa confirmation messages.
- **Parser update:** Added support for the screenshot format: `Confirmed.You have received Ksh... from NAME masked-phone on DATE at TIME New M-PESA balance...`. This now parses as P2P income and captures the M-Pesa code.

## Current Issue - Generic "Sync failed" Despite Permission
**Status:** Diagnostic + likely date parsing fix applied / needs new APK confirmation
- **Observation:** Settings showed "Sync failed. Check SMS permission and try again" even though SMS permission was granted.
- **Cause:** The app was hiding the actual failure stage behind a generic message. A likely runtime failure was parser date handling: it created dates from strings such as `2026-05-12 6:35 PM`, which can be unreliable in React Native/Hermes and can throw when converting to ISO for upload.
- **Fix:** Sync now reports the actual failure stage and message (`permission`, `read/process`, `supabase`, etc.). The parser now builds transaction timestamps manually from day/month/year and 12-hour time instead of relying on string date parsing.

## 1. Build Failures & Asset Configuration
**Status:** ✅ Resolved
- **Issue:** EAS Build failed during the `expo doctor` and `prebuild` phases.
- **Cause:** The `app.json` was referencing a `splash.png` that did not exist in the `/assets` directory.
- **Resolution:** Temporarily pointed the splash screen to `icon.png` and created a standard set of production-ready icons (adaptive, notification, and splash) to satisfy the build requirements.

## 2. Runtime Crash & Module Loading
> Superseded by the 2026-05-14 fix pass above. Keep this section as historical context until a fresh APK confirms the native module on-device.
**Status:** ⚠️ Partial / Critical Finding
- **Issue:** The app would crash ("WikTrack keeps stopping").
- **Cause:** Signature mismatch in Kotlin module.
- **Current State:** The crash is prevented using `requireOptionalNativeModule`, but the module is **failing to load** in production builds. Diagnostic alert shows: `"SmsReaderModule is null"`.
- **Next Step:** Verify why the Local Expo Module is not being linked during EAS prebuild. Check `package.json` paths and `expo-module.config.json`.

## 3. Email Verification Redirect & Session Stale
**Status:** ⚠️ In Progress
- **Issue 1:** Redirected to `localhost:3000`. (Update Supabase Site URL to `https://wiktrack.vercel.app`).
- **Issue 2:** App says "not verified" even after clicking link. 
- **Cause:** The app's `getSession()` call may be returning a stale user session that hasn't updated the `email_confirmed_at` flag yet.
- **Next Step:** Implement `supabase.auth.refreshSession()` or a forced re-login after verification.

## 4. SMS Sync "Empty" Dashboard
**Status:** ℹ️ Information / Behavioral
- **Issue:** Pulling to refresh resulted in 0 transactions despite having M-Pesa messages.
- **Cause:** The app is an **Income Tracker**. It is designed to strictly parse incoming payments (`"received from"`). The test messages on the user's phone were outgoing payments (`"paid to"`), which the parser correctly ignores.
- **Resolution:** Added diagnostic alerts to the app to surface the raw number of messages read vs. parsed.

**Follow-up - 2026-05-14:** A later device test showed parsed income transactions visible on the Transactions page but not immediately visible on Dashboard. Home now refreshes dashboard data whenever the tab regains focus, and the Recent Payments empty state no longer says "today" because that list shows the latest transactions overall.

## 4a. Historical Transactions Grouped Ambiguously
**Status:** Fix applied / needs new APK confirmation
- **Issue:** Imported old SMS history, such as April 16, 2024 messages, displayed under a generic `Apr 16` group. That made prior-year transactions look like current-year transactions.
- **Cause:** Transaction section headers and row date labels omitted the year for all older records.
- **Resolution:** Prior-year transactions now render with the year in both group headers and row timestamps. Transactions also has date filter chips so older imported history can be narrowed by year or recent period.

## 5. Notification Permission Sequence
**Status:** ✅ Resolved
- **Issue:** Notification permissions were not being requested early enough.
- **Resolution:** Integrated the `registerForPushNotifications` call into the `FirstSyncScreen` (onboarding) and `HomeScreen` (mount) to ensure the push token is captured as soon as possible.

---
*Last Updated: May 14, 2026*
