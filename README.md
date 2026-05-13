# WikTrack

M-Pesa income tracking app for Kenya's informal economy. Reads SMS messages from Safaricom M-Pesa and displays an income dashboard for small business owners.

## Project Structure

```
Wik track/
├── WikTrack/               # Expo React Native app (Android)
│   ├── modules/            # [NEW] Custom Native Expo Modules
│   │   └── sms-reader      # Native Android SMS reader module
│   ├── src/
│   │   ├── screens/        # All app screens (Home, Transactions, Settings, Onboarding)
│   │   ├── components/     # Reusable UI components (cards, badges, shared)
│   │   ├── hooks/          # Custom hooks (useSmsSync, useDashboard, useTransactions)
│   │   ├── lib/            # Utilities (smsParser, smsReader, supabase, notifications)
│   │   ├── store/          # Zustand state management
│   │   └── theme/          # Design tokens (colors, typography, spacing, shadows)
│   ├── assets/             # App icons & branding
│   ├── app.json            # Expo config
│   └── eas.json            # EAS Build config
├── wiktrack-backend/       # Node.js + Express API server (Vercel Ready)
│   ├── routes/             # API routes (auth, dashboard, cron)
│   ├── lib/                # Backend utilities (supabase client, notifications)
│   ├── vercel.json         # [NEW] Vercel deployment & Cron config
│   └── index.js            # Express server entry point
├── supabase-schema.sql     # Database schema (already applied)
└── PesaBoard_Design_Spec_v2.md  # UI/UX design specification
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 54 (New Architecture Ready) |
| Native Logic | **Custom Local Expo Modules (Kotlin)** |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| State | Zustand with AsyncStorage persistence |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Backend | Node.js + Express |
| Hosting | **Vercel (Serverless)** |
| Scheduling | **Vercel Cron (8:00 PM EAT)** |
| Notifications | Expo Push Notifications (FCM) |
| Build | EAS Build (cloud) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Expo account (for EAS builds)
- Android phone for testing

### Frontend (Expo App)
```bash
cd WikTrack
npm install
npx expo run:android   # Build locally
# OR
eas build -p android --profile preview   # Build in cloud
```

### Backend (Deployed on Vercel)
The backend is now serverless and deployed to Vercel.
- **URL**: `https://wiktrack.vercel.app`
- **Cron**: Automated via `vercel.json`

## Key Features (Phase 1)
- ✅ **Native SMS Engine**: Custom module for high-performance Android SMS reading.
- ✅ **Full Auth Flow**: Login & Registration with email/password via Supabase.
- ✅ **Income Dashboard**: Daily/weekly/monthly summaries with 7-day trend chart.
- ✅ **Transaction List**: Real-time filtering and search for M-Pesa transactions.
- ✅ **Auto-Sync**: Background-ready syncing with deduplication via SHA-256 hashing.
- ✅ **Smart Summaries**: Daily 8PM push notification via Vercel Cron.
- ✅ **Branding**: Configured with adaptive icons and notification tokens.

## Environment Variables

### Backend (`wiktrack-backend/` via Vercel)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role secret
- `CRON_SECRET` — Secret key to authorize Vercel Cron jobs
- `NODE_ENV` — `production`

## License
Private — All rights reserved.
