# WikTrack Development Issue Log

This document records the technical challenges, bugs, and resolutions encountered during the finalization of the WikTrack production build.

## 1. Build Failures & Asset Configuration
**Status:** ✅ Resolved
- **Issue:** EAS Build failed during the `expo doctor` and `prebuild` phases.
- **Cause:** The `app.json` was referencing a `splash.png` that did not exist in the `/assets` directory.
- **Resolution:** Temporarily pointed the splash screen to `icon.png` and created a standard set of production-ready icons (adaptive, notification, and splash) to satisfy the build requirements.

## 2. Runtime Crash & Module Loading
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

## 5. Notification Permission Sequence
**Status:** ✅ Resolved
- **Issue:** Notification permissions were not being requested early enough.
- **Resolution:** Integrated the `registerForPushNotifications` call into the `FirstSyncScreen` (onboarding) and `HomeScreen` (mount) to ensure the push token is captured as soon as possible.

---
*Last Updated: May 14, 2026*
