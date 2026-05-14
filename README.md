# WikTrack

Free Android app for Kenyan business owners who want to track M-Pesa income from SMS messages. WikTrack reads Safaricom M-Pesa messages on-device, imports income transactions to Supabase, shows dashboard/transaction views, and sends a daily 8:00 PM EAT summary through Vercel Cron and Expo push notifications.

## Status

Phase 1 is complete and testing-ready.

- Native SMS reading works on the Android APK.
- Existing-account login works.
- Supabase email verification works, but the confirmation link currently opens the backend URL; after verifying, users log in again.
- Daily summary notifications work after Firebase FCM V1 credentials are assigned in Expo/EAS.
- The app is free. There are no subscriptions or trials.

## Project Structure

```text
Wik track/
|-- WikTrack/                 # Expo React Native Android app
|   |-- modules/sms-reader/   # Custom local Expo module for Android SMS reading
|   |-- src/
|   |   |-- screens/          # Home, Transactions, Settings, Onboarding
|   |   |-- components/       # Cards, lists, badges, shared UI
|   |   |-- hooks/            # SMS sync, dashboard, transaction hooks
|   |   |-- lib/              # SMS parser/reader, Supabase, notifications
|   |   |-- store/            # Zustand persisted state
|   |   `-- theme/            # Colors, typography, spacing, shadows
|   |-- assets/               # App icon/adaptive/notification assets
|   |-- google-services.json  # Firebase Android config for com.wiktrack.app
|   |-- app.json              # Expo config
|   `-- eas.json              # EAS build profiles
|-- wiktrack-backend/         # Express backend deployed to Vercel
|   |-- routes/cron.js        # Vercel Cron daily summary endpoint
|   |-- lib/notifications.js  # Expo push sender
|   |-- lib/supabase.js       # Service-role Supabase client
|   |-- vercel.json           # Serverless route + cron config
|   `-- index.js              # Express app entry
|-- supabase-schema.sql       # Applied database schema
`-- PesaBoard_Design_Spec_v2.md
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile app | Expo SDK 54, React Native 0.81 |
| Native SMS | Local Expo module in Kotlin |
| Navigation | React Navigation 7 |
| State | Zustand + AsyncStorage |
| Database/Auth | Supabase PostgreSQL, Auth, RLS |
| Backend | Express on Vercel serverless functions |
| Scheduler | Vercel Cron, `0 17 * * *` UTC = 8:00 PM EAT |
| Push | Expo Push Notifications + Firebase FCM V1 |
| Charts/icons | `react-native-chart-kit`, `lucide-react-native` |

## App Data Flow

The Android app talks directly to Supabase for auth, settings, SMS imports, dashboard reads, and transaction reads. The backend is only required for scheduled push summaries:

```text
Android app -> saves businesses.push_token in Supabase
Vercel Cron -> calls wiktrack-backend /api/cron/daily-summary
Backend -> reads Supabase with service role key
Backend -> sends Expo push notification through FCM V1 credentials
```

## Setup

### Frontend

```bash
cd WikTrack
npm install
npx expo-doctor
```

For local Metro:

```bash
npm run start
```

For local Android release APK on this Windows machine:

```powershell
cd "C:\Users\paul\Documents\Wik\Wik track\WikTrack\android"
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:NODE_ENV="production"
.\gradlew.bat :app:assembleRelease
```

APK output:

```text
WikTrack/android/app/build/outputs/apk/release/app-release.apk
```

### Backend

```bash
cd wiktrack-backend
npm install
node index.js
```

Production backend:

```text
https://wiktrack.vercel.app
```

## Environment Variables

Set these in Vercel Production for `wiktrack-backend`:

```text
SUPABASE_URL
SUPABASE_SERVICE_KEY
CRON_SECRET
NODE_ENV=production
```

Local backend uses `wiktrack-backend/.env`. Never commit the Supabase service-role key or Firebase service-account private key.

## Push Notifications

Android push requires two Firebase pieces:

- `WikTrack/google-services.json`, referenced by `app.json` as `android.googleServicesFile`.
- Firebase FCM V1 service account key uploaded to Expo/EAS credentials for `com.wiktrack.app`.

The service account private key was used during setup and should be rotated after testing because it was exposed in chat.

## Useful Checks

```bash
# App health
cd WikTrack
npx expo-doctor

# Backend syntax
cd ../wiktrack-backend
node --check routes/cron.js
node --check lib/notifications.js

# Backend health
curl https://wiktrack.vercel.app/
```

## License

Private. All rights reserved.
