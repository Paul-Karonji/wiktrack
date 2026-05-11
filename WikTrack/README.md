# WikTrack

M-Pesa income tracking app for Kenya's informal economy. Reads SMS messages from Safaricom M-Pesa and displays an income dashboard for small business owners.

## Project Structure

```
Wik track/
├── WikTrack/               # Expo React Native app (Android)
│   ├── App.js              # Root component + navigation
│   ├── src/
│   │   ├── screens/        # All app screens (Home, Transactions, Settings, Onboarding)
│   │   ├── components/     # Reusable UI components (cards, badges, shared)
│   │   ├── hooks/          # Custom hooks (useSmsSync, useDashboard, useTransactions)
│   │   ├── lib/            # Utilities (smsParser, smsReader, supabase, notifications)
│   │   ├── store/          # Zustand state management
│   │   └── theme/          # Design tokens (colors, typography, spacing, shadows)
│   ├── assets/             # App icons
│   ├── app.json            # Expo config
│   └── eas.json            # EAS Build config
├── wiktrack-backend/       # Node.js + Express API server
│   ├── index.js            # Express server entry point
│   ├── routes/             # API routes (auth, dashboard)
│   ├── jobs/               # Cron jobs (dailySummary)
│   └── lib/                # Backend utilities (supabase client, notifications)
├── supabase-schema.sql     # Database schema (already applied)
└── PesaBoard_Design_Spec_v2.md  # UI/UX design specification
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 54 (bare workflow) |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| State | Zustand with AsyncStorage persistence |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Backend | Node.js + Express |
| Notifications | Expo Push Notifications (FCM) |
| Build | EAS Build (cloud) |
| Icons | Lucide React Native |
| Charts | react-native-chart-kit |

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
npx expo start
```

### Backend
```bash
cd wiktrack-backend
cp .env.example .env   # Fill in your Supabase credentials
npm install
node index.js
```

### Build APK
```bash
cd WikTrack
npx eas-cli build --profile preview --platform android
```

## Key Features (Phase 1)
- SMS parsing for 4 M-Pesa transaction types: Till, Paybill, Pochi la Biashara, P2P
- Income dashboard with daily/weekly/monthly summaries
- 7-day income bar chart
- Transaction list with search and type filtering
- Onboarding flow with phone auth
- Daily 8PM push notification summary
- 7-day free trial logic
- Deduplication via SMS hash

## Environment Variables

### Frontend (`WikTrack/src/lib/supabase.js`)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous public JWT

### Backend (`wiktrack-backend/.env`)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role secret
- `PORT` — Server port (default 3000)
- `NODE_ENV` — Environment mode

## License
Private — All rights reserved.
