
**WIKTRACK**

Full Technical Build Reference

*The M-Pesa Income Dashboard for Kenya's Informal Economy*

|<p>**Version**</p><p>1\.0 — Phase 1 Build</p>|<p>**Date**</p><p>May 2026</p>|
| :- | :- |
|<p>**Platform**</p><p>Android APK (React Native + Expo)</p>|<p>**Market**</p><p>Kenya — Nairobi estates first</p>|

*Built for self-reference. Every decision, every tech choice, every code structure — in one place.*


# **PART 1 — WHAT WE ARE BUILDING**

### **The Problem**
Kenya has over 15 million informal small business owners. Every day, billions of shillings flow through M-Pesa into their phones — but the vast majority have zero visibility into their own income data. A mama mboga in Kasarani may receive KES 5,000 every day through Pochi la Biashara, but she cannot answer: How much did I make today? Who is my best customer? Can I afford to restock?

### **The Solution — WikTrack**
WikTrack is a lightweight Android app (distributed as a direct APK — no Play Store) that automatically reads M-Pesa SMS messages on the business owner's phone and displays a clean income dashboard. It supports all 4 M-Pesa transaction types, sends a daily push notification summary, and syncs all data to a cloud database.

### **The Three Phases**

|**Phase**|**Timeline**|**What Gets Built**|**Revenue Source**|
| :- | :- | :- | :- |
|Phase 1|Month 1-3|SMS dashboard + push notifications + APK|Subscriptions KES 299-699/mo|
|Phase 2|Month 3-6|Business Income Report PDF + expense tracking|Premium tier + one-time reports|
|Phase 3|Month 9+|Lending referral partnerships + credit API|Referral fees per approved loan|

### **The Four M-Pesa Transaction Types We Support**

|**Priority**|**Type**|**Who Uses It**|**Dashboard Status**|
| :- | :- | :- | :- |
|1 — Primary|Pochi la Biashara|1\.15M active wallets, 81.7% YoY growth — zero existing dashboard|Full support Phase 1|
|2 — Primary|P2P Personal M-Pesa|Boda boda, freelancers, casual traders — millions unserved|Full support Phase 1|
|3 — Secondary|Till / BuyGoods|Registered merchants — partially served by M-PESA Business App|Full support Phase 1|
|4 — Secondary|Paybill|Registered businesses — similar to Till|Full support Phase 1|


# **PART 2 — CONFIRMED TECH STACK**

**Every technology decision is final for Phase 1. Do not change these without a strong reason.**

|**Layer**|**Technology**|**Cost**|**Why This Choice**|
| :- | :- | :- | :- |
|Android App|React Native + Expo (bare workflow)|Free|Write JS once, produces Android APK. Bare workflow needed for READ\_SMS native module.|
|Database|Supabase (PostgreSQL)|Free tier|Auth + REST API + real-time subscriptions included. No separate auth system to build.|
|Push Notifications|Expo Notifications (FCM)|Free forever|Replaces Africa's Talking in Phase 1. Zero cost, zero setup friction.|
|APK Distribution|EAS Build + direct download link|Free|Faster than Play Store by weeks. Share link via WhatsApp. Install on client phones directly.|
|State Management|Zustand|Free|Lightweight, minimal boilerplate. Better than Redux for this app size.|
|Web Companion|React + Vite on Vercel|Free tier|For accountants. Deferred to Phase 2.|
|Payments|IntaSend or Pesapal|Small % fee|M-Pesa payment collection for subscriptions.|
|WhatsApp Messaging|Meta WhatsApp Cloud API|~$0.01/msg|Deferred to Phase 2. Push notifications cover Phase 1.|

|<p>**Phase 1 Running Cost**</p><p>Total infrastructure cost for your first 50 users: KES 0 per month. Every service above runs on a free tier that covers your entire early stage. You spend nothing until you have paying subscribers.</p>|
| :- |


# **PART 3 — SYSTEM ARCHITECTURE**

### **The Three Pieces**
WikTrack has three separate pieces that talk to each other:

`  `[Android App]   <-->   [Backend Server]   <-->   [Supabase Database]

`  `(user touches)         (the brain)                (all data lives here)



`  `External services:

`  `[Expo Notifications] <-- backend sends push to user phone


`  `[Meta WhatsApp API]  <-- backend sends daily summary (Phase 2)

### **The Two Data Pipelines**
This is the most important architectural concept in WikTrack. There are two ways a transaction enters the database:

|**Pipeline**|**Data Source**|**Who It Serves**|**How It Works**|
| :- | :- | :- | :- |
|Path A — SMS Reader|Device SMS inbox (MPESA sender)|ALL users — Pochi, P2P, Till, Paybill|App reads M-Pesa SMS inbox with READ\_SMS permission. Parses messages on-device. Only clean JSON goes to Supabase. No raw SMS ever leaves the phone.|

| :- |

### **Backend Server — Three Jobs**
Your Node.js backend on Vercel does exactly three things in Phase 1:

- Sends daily push notification summary at 8PM EAT via Expo Notifications
- Serves API data to the app (dashboard totals, report generation)

### **Supabase — What It Gives You For Free**
- PostgreSQL database — all your tables
- Auto-generated REST API — your app reads/writes data without you building API routes for every request
- Auth system — phone OTP login, sessions, JWT tokens — zero code required
- Real-time subscriptions — dashboard updates live when new payment arrives
- Row Level Security — users can only see their own business data
- Dashboard — view all your data visually like a spreadsheet


# **PART 4 — DATABASE SCHEMA (SUPABASE)**

Run this SQL once in the Supabase SQL Editor (supabase.com > your project > SQL Editor). Never run it again — it creates your entire database structure.

### **Table 1 — businesses**
One row per business owner using WikTrack. Extended from Supabase's built-in auth.users table.

CREATE TABLE businesses (

`  `id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `user\_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,

`  `name            TEXT NOT NULL,                  -- business name

`  `owner\_phone     TEXT NOT NULL,                  -- 0712345678 format

`  `shortcode       TEXT,                           -- Till or Paybill number (nullable)

`  `business\_type   TEXT,                           -- 'salon','kiosk','hardware', etc.

`  `county          TEXT,

`  `enabled\_types   TEXT[] DEFAULT ARRAY['till','paybill','pochi','p2p'],



`  `push\_token      TEXT,                           -- Expo push token for notifications

`  `notifications   BOOLEAN DEFAULT TRUE,           -- push notifications on/off

`  `alert\_time      TIME DEFAULT '20:00',           -- daily summary time (8PM EAT)

`  `plan            TEXT DEFAULT 'free',            -- 'free','starter','business','pro'

`  `plan\_expires\_at TIMESTAMP,

`  `trial\_started   TIMESTAMP DEFAULT NOW(),        -- for 7-day trial countdown

`  `created\_at      TIMESTAMP DEFAULT NOW()

);

### **Table 2 — transactions**

CREATE TABLE transactions (

`  `id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `business\_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,

`  `type          TEXT NOT NULL CHECK (type IN ('till','paybill','pochi','p2p')),

`  `amount        NUMERIC(12,2) NOT NULL,

`  `sender\_name   TEXT,

`  `sender\_phone  TEXT,

`  `account\_ref   TEXT,                     -- Paybill account reference


`  `sms\_hash      TEXT UNIQUE,              -- SHA256 of raw SMS — prevents SMS duplicates

`  `timestamp     TIMESTAMP NOT NULL,


`  `shortcode     TEXT,

`  `balance       NUMERIC(12,2),            -- M-Pesa balance after this transaction

`  `note          TEXT,                     -- optional user note on transaction

`  `created\_at    TIMESTAMP DEFAULT NOW()

);

### **Table 3 — expenses (Phase 2)**
CREATE TABLE expenses (

`  `id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `business\_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,

`  `amount        NUMERIC(12,2) NOT NULL,

`  `category      TEXT NOT NULL,  -- 'stock','rent','staff','transport','other'

`  `description   TEXT,

`  `date          DATE NOT NULL DEFAULT CURRENT\_DATE,

`  `created\_at    TIMESTAMP DEFAULT NOW()

);

### **Table 4 — daily\_summaries (performance cache)**
CREATE TABLE daily\_summaries (

`  `id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `business\_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,

`  `date            DATE NOT NULL,

`  `total\_income    NUMERIC(12,2) DEFAULT 0,

`  `total\_expenses  NUMERIC(12,2) DEFAULT 0,

`  `tx\_count        INTEGER DEFAULT 0,

`  `top\_sender      TEXT,

`  `UNIQUE(business\_id, date)

);

### **Indexes + Row Level Security**
-- Indexes for query performance

CREATE INDEX idx\_transactions\_business\_id ON transactions(business\_id);

CREATE INDEX idx\_transactions\_timestamp   ON transactions(timestamp DESC);

CREATE INDEX idx\_transactions\_type        ON transactions(type);

CREATE INDEX idx\_expenses\_business\_id     ON expenses(business\_id);

CREATE INDEX idx\_businesses\_shortcode     ON businesses(shortcode);



-- Row Level Security — users can ONLY see their own data

ALTER TABLE businesses   ENABLE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses     ENABLE ROW LEVEL SECURITY;



CREATE POLICY 'own business only' ON businesses

`  `FOR ALL USING (user\_id = auth.uid());



CREATE POLICY 'own transactions only' ON transactions

`  `FOR ALL USING (

`    `business\_id IN (SELECT id FROM businesses WHERE user\_id = auth.uid())

`  `);



CREATE POLICY 'own expenses only' ON expenses

`  `FOR ALL USING (

`    `business\_id IN (SELECT id FROM businesses WHERE user\_id = auth.uid())

`  `);


# **PART 5 — THE SMS PARSER (CORE ENGINE)**

|<p>**Build This First**</p><p>The SMS parser is the single most important piece of code in WikTrack. Every other feature depends on it. Build it first. Test it on your own M-Pesa inbox. Get it working before touching the UI.</p>|
| :- |

### **The 4 Real M-Pesa SMS Formats**
These are the exact formats Safaricom sends. Your regex must handle all of them.

-- Type 1: Till / BuyGoods

Confirmed. Ksh500.00 received from JOHN DOE 0712345678 on 29/4/26 at 2:14 PM.

New Till balance is Ksh12,450.00. Transaction cost, Ksh0.00.



-- Type 2: Paybill

Confirmed. Ksh1,200.00 received from MARY WANJIKU 0722123456 for account

REF001 on 29/4/26 at 10:05 AM. New Paybill balance is Ksh8,900.00.



-- Type 3: Pochi la Biashara

Confirmed. Ksh350.00 received from PETER KAMAU 0733987654 via Pochi la

Biashara on 29/4/26 at 9:30 AM. New Pochi balance is Ksh4,200.00.



-- Type 4: P2P (note: phone comes BEFORE name in this format)

Confirmed. Ksh200.00 received from 0744111222 JANE NJERI on 29/4/26 at

11:45 AM. New M-PESA balance is Ksh1,100.00.

### **smsParser.js — Full Implementation**
Create this file at: src/lib/smsParser.js

// smsParser.js — Parses all 4 M-Pesa SMS formats into structured JSON



export const SMS\_TYPES = {

`  `TILL: 'till', PAYBILL: 'paybill', POCHI: 'pochi', P2P: 'p2p',

};



// Shared helpers

const parseAmount = (str) => parseFloat(str.replace(/,/g, ''));

const parseDate = (d, t) => {

`  `const [day, month, yr] = d.split('/');

`  `const year = parseInt(yr) + 2000;

`  `return new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')} ${t}`);

};



// REGEX PATTERNS — one per SMS type

const TILL\_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+([A-Z][A-Z\s]+?)\s+(\d{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Till balance is Ksh([\d,]+(?:\.\d+)?)/i;



const PAYBILL\_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+([A-Z][A-Z\s]+?)\s+(\d{10})\s+for account\s+(\S+)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Paybill balance is Ksh([\d,]+(?:\.\d+)?)/i;



const POCHI\_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+([A-Z][A-Z\s]+?)\s+(\d{10})\s+via Pochi la Biashara\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Pochi balance is Ksh([\d,]+(?:\.\d+)?)/i;



// P2P: phone number comes BEFORE name in this format

const P2P\_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(\d{10})\s+([A-Z][A-Z\s]+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New M-PESA balance is Ksh([\d,]+(?:\.\d+)?)/i;



export function parseMpesaSMS(smsBody, enabledTypes = ['till','paybill','pochi','p2p']) {

`  `let match;



`  `if (enabledTypes.includes('till') && (match = smsBody.match(TILL\_REGEX))) {

`    `return { type: SMS\_TYPES.TILL, amount: parseAmount(match[1]),

`      `senderName: match[2].trim(), senderPhone: match[3], accountRef: null,

`      `timestamp: parseDate(match[4], match[5]), balance: parseAmount(match[6]), rawSms: smsBody };

`  `}

`  `if (enabledTypes.includes('paybill') && (match = smsBody.match(PAYBILL\_REGEX))) {

`    `return { type: SMS\_TYPES.PAYBILL, amount: parseAmount(match[1]),

`      `senderName: match[2].trim(), senderPhone: match[3], accountRef: match[4],

`      `timestamp: parseDate(match[5], match[6]), balance: parseAmount(match[7]), rawSms: smsBody };

`  `}

`  `if (enabledTypes.includes('pochi') && (match = smsBody.match(POCHI\_REGEX))) {

`    `return { type: SMS\_TYPES.POCHI, amount: parseAmount(match[1]),

`      `senderName: match[2].trim(), senderPhone: match[3], accountRef: null,

`      `timestamp: parseDate(match[4], match[5]), balance: parseAmount(match[6]), rawSms: smsBody };

`  `}

`  `if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P\_REGEX))) {

`    `return { type: SMS\_TYPES.P2P, amount: parseAmount(match[1]),

`      `senderName: match[3].trim(), senderPhone: match[2], accountRef: null,

`      `timestamp: parseDate(match[4], match[5]), balance: parseAmount(match[6]), rawSms: smsBody };

`  `}

`  `return null; // not an M-Pesa received transaction

}

|<p>**What parseMpesaSMS() Returns**</p><p>For every M-Pesa SMS it returns: { type, amount, senderName, senderPhone, accountRef, timestamp, balance, rawSms }. It returns null if the message is not a recognized M-Pesa received payment (e.g. withdrawal, airtime, sent money — these are ignored).</p>|
| :- |


# **PART 6 — REACT NATIVE APP STRUCTURE**

### **Setup Commands (Run Once on Windows)**
\# 1. Create the project

npx create-expo-app WikTrack --template bare-minimum

cd WikTrack



\# 2. Install all dependencies

npx expo install expo-dev-client

npx expo install expo-notifications        # push notifications

npm install @supabase/supabase-js          # database client

npm install react-native-get-sms-android   # READ\_SMS native module

npm install @react-native-async-storage/async-storage

npm install react-native-chart-kit react-native-svg   # charts

npm install @react-navigation/native @react-navigation/bottom-tabs

npm install react-native-screens react-native-safe-area-context

npm install zustand                        # state management

npm install react-native-share             # share reports

npm install lucide-react-native            # icons



\# 3. Install EAS CLI for building APK

npm install -g eas-cli

eas login



\# 4. Build APK (run this whenever you want a new APK)

eas build --profile preview --platform android

### **AndroidManifest.xml — Required Permissions**
Add these inside the <manifest> tag in android/app/src/main/AndroidManifest.xml:

<uses-permission android:name="android.permission.READ\_SMS" />

<uses-permission android:name="android.permission.RECEIVE\_SMS" />

<uses-permission android:name="android.permission.INTERNET" />

<uses-permission android:name="android.permission.VIBRATE" />

<uses-permission android:name="android.permission.POST\_NOTIFICATIONS" />



<!-- READ\_SMS: read M-Pesa inbox -->

<!-- RECEIVE\_SMS: catch new M-Pesa messages as they arrive -->

<!-- POST\_NOTIFICATIONS: show push notification alerts -->

### **eas.json — APK Build Profile**
{

`  `"build": {

`    `"preview": {

`      `"android": {

`        `"buildType": "apk"   // produces .apk for direct sideloading

`      `}

`    `},

`    `"production": {

`      `"android": {

`        `"buildType": "app-bundle"   // for Play Store (Phase 3)

`      `}

`    `}

`  `}

}

### **Full Folder Structure**
WikTrack/

├── app.json                        # Expo config

├── eas.json                        # Build profiles

├── App.js                          # Root — navigation setup

├── src/

│   ├── screens/

│   │   ├── onboarding/

│   │   │   ├── WelcomeScreen.js    # First launch

│   │   │   ├── CreateAccountScreen.js  # Phone + name

│   │   │   ├── PaymentTypeScreen.js    # Select Pochi/P2P/Till/Paybill

│   │   │   ├── SmsPermissionScreen.js  # MOST CRITICAL SCREEN

│   │   │   └── FirstSyncScreen.js      # Import history progress

│   │   ├── HomeScreen.js           # Dashboard — today total, chart, recent

│   │   ├── TransactionsScreen.js   # Full list with filters + search

│   │   ├── TransactionDetailScreen.js  # Single transaction detail

│   │   └── SettingsScreen.js       # Profile, sync, plan, notifications

│   ├── components/

│   │   ├── HeroMetricCard.js       # Today's income — big green card

│   │   ├── SummaryCard.js          # This Week / This Month cards

│   │   ├── TransactionRow.js       # Single row in transaction list

│   │   ├── TypeBadge.js            # Till / Pochi / P2P badge

│   │   ├── SyncStatusIndicator.js  # Green dot + 'Synced 3 mins ago'

│   │   ├── FilterChip.js           # Filter pills on transaction screen

│   │   └── EmptyState.js           # No data placeholder

│   ├── hooks/

│   │   ├── useSmsSync.js           # READ\_SMS + parse + Supabase sync

│   │   └── useDashboard.js         # Fetch dashboard data

│   ├── lib/

│   │   ├── supabase.js             # Supabase client (anon key)

│   │   ├── smsParser.js            # The core SMS parser

│   │   ├── notifications.js        # Expo push notification helpers

│   │   ├── formatCurrency.js       # KES 12,450 formatter

│   │   └── formatDate.js           # Date/time formatters

│   ├── store/

│   │   └── index.js                # Zustand global store

│   └── theme/

│       ├── colors.js               # All color tokens

│       ├── spacing.js              # Spacing scale

│       └── typography.js           # Font sizes + weights

└── android/                        # Native Android files (auto-generated)


# **PART 7 — KEY CODE FILES**

### **src/lib/supabase.js**
import { createClient } from '@supabase/supabase-js';

import AsyncStorage from '@react-native-async-storage/async-storage';



const SUPABASE\_URL = 'https://xxxx.supabase.co';  // from supabase.com dashboard

const SUPABASE\_ANON\_KEY = 'eyJhbGci...';          // anon key — safe to use in app



export const supabase = createClient(SUPABASE\_URL, SUPABASE\_ANON\_KEY, {

`  `auth: {

`    `storage: AsyncStorage,

`    `autoRefreshToken: true,

`    `persistSession: true,

`    `detectSessionInUrl: false,

`  `},

});

### **src/lib/notifications.js**
import \* as Notifications from 'expo-notifications';

import { Platform } from 'react-native';

import { supabase } from './supabase';



// Configure how notifications appear when app is open

Notifications.setNotificationHandler({

`  `handleNotification: async () => ({

`    `shouldShowAlert: true,

`    `shouldPlaySound: true,

`    `shouldSetBadge: false,

`  `}),

});



// Request permission + get push token + save to Supabase

export async function registerForPushNotifications(businessId) {

`  `if (Platform.OS !== 'android') return null;



`  `// Create Android notification channel

`  `await Notifications.setNotificationChannelAsync('default', {

`    `name: 'WikTrack Alerts',

`    `importance: Notifications.AndroidImportance.MAX,

`    `vibrationPattern: [0, 250, 250, 250],

`  `});



`  `// Request permission

`  `const { status } = await Notifications.requestPermissionsAsync();

`  `if (status !== 'granted') return null;



`  `// Get the push token (this is the 'address' for this phone)

`  `const token = (await Notifications.getExpoPushTokenAsync()).data;



`  `// Save token to Supabase so backend can send notifications

`  `await supabase

.from('businesses')

.update({ push\_token: token })

.eq('id', businessId);



`  `return token;

}

### **src/hooks/useSmsSync.js**
import { useEffect } from 'react';

import { PermissionsAndroid, Platform } from 'react-native';

import SmsAndroid from 'react-native-get-sms-android';

import { parseMpesaSMS } from '../lib/smsParser';

import { supabase } from '../lib/supabase';

import { useBusinessStore } from '../store';

import AsyncStorage from '@react-native-async-storage/async-storage';

import \* as Crypto from 'expo-crypto';  // for SMS hashing



const SYNC\_KEY = '@wiktrack\_last\_sync';



export function useSmsSync() {

`  `const { businessId, enabledTypes } = useBusinessStore();



`  `useEffect(() => { requestAndSync(); }, []);



`  `async function requestAndSync() {

`    `if (Platform.OS !== 'android') return;



`    `const granted = await PermissionsAndroid.request(

`      `PermissionsAndroid.PERMISSIONS.READ\_SMS,

`      `{

`        `title: 'WikTrack needs to read your M-Pesa messages',

`        `message: 'We only read messages from MPESA to track your business income. We never read personal messages.',

`        `buttonPositive: 'Allow',

`        `buttonNegative: 'Cancel',

`      `}

`    `);

`    `if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;



`    `const lastSync = parseInt(await AsyncStorage.getItem(SYNC\_KEY) || '0');



`    `const filter = {

`      `box: 'inbox',

`      `address: 'MPESA',   // ONLY M-Pesa messages — never reads personal SMS

`      `minDate: lastSync,

`    `};



`    `SmsAndroid.list(JSON.stringify(filter), (fail) => {

`      `console.error('SMS read failed:', fail);

`    `}, async (count, smsList) => {

`      `const messages = JSON.parse(smsList);



`      `const transactions = await Promise.all(

`        `messages

.map(sms => parseMpesaSMS(sms.body, enabledTypes))

.filter(Boolean)

.map(async tx => ({

...tx,

`            `business\_id: businessId,

`            `source: 'sms',

`            `// Hash the raw SMS for deduplication

`            `sms\_hash: await Crypto.digestStringAsync(

`              `Crypto.CryptoDigestAlgorithm.SHA256, tx.rawSms

`            `),

`            `rawSms: undefined, // never store raw SMS in database

`          `}))

`      `);



`      `if (transactions.length === 0) return;



`      `const { error } = await supabase

.from('transactions')

.upsert(transactions, { onConflict: 'sms\_hash' });



`      `if (error) console.error('Sync error:', error);

`      `else await AsyncStorage.setItem(SYNC\_KEY, Date.now().toString());

`    `});

`  `}

}

### **src/store/index.js — Zustand Global Store**
import { create } from 'zustand';

import { persist, createJSONStorage } from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';



export const useBusinessStore = create(

`  `persist(

`    `(set, get) => ({

`      `// Business data

`      `businessId: null,

`      `businessName: '',

`      `ownerName: '',

`      `ownerPhone: '',

`      `plan: 'free',

`      `trialStarted: null,



`      `// SMS parser settings

`      `enabledTypes: ['pochi', 'p2p', 'till', 'paybill'],



`      `// Sync state

`      `lastSyncAt: null,

`      `syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'offline'



`      `// Actions

`      `setBusiness: (data) => set(data),

`      `setEnabledTypes: (types) => set({ enabledTypes: types }),

`      `setSyncStatus: (status) => set({ syncStatus: status }),

`      `setLastSync: () => set({ lastSyncAt: new Date().toISOString() }),



`      `// Trial helpers

`      `getDaysLeftInTrial: () => {

`        `const started = get().trialStarted;

`        `if (!started) return 0;

`        `const diff = Date.now() - new Date(started).getTime();

`        `const daysPassed = Math.floor(diff / (1000 \* 60 \* 60 \* 24));

`        `return Math.max(0, 7 - daysPassed);

`      `},

`    `}),

`    `{

`      `name: 'wiktrack-store',

`      `storage: createJSONStorage(() => AsyncStorage),

`    `}

`  `)

);


# **PART 8 — BACKEND SERVER (NODE.JS + RAILWAY)**

### **Project Structure**
wiktrack-backend/

├── index.js              # Entry point — Express app setup

├── routes/


│   ├── dashboard.js      # Dashboard summary endpoints

│   └── auth.js           # Plan management

├── lib/

│   ├── supabase.js       # Supabase client (SERVICE ROLE KEY — not anon)

│   ├── notifications.js  # Expo push notification sender


├── jobs/

│   └── dailySummary.js   # Cron job — runs at 8PM EAT daily

├── .env                  # NEVER commit this to GitHub

└── package.json

### **.env File — Environment Variables**
\# Supabase — use SERVICE ROLE key on backend (not anon key)

SUPABASE\_URL=https://xxxx.supabase.co

SUPABASE\_SERVICE\_KEY=eyJhbGci...   # service role key from Supabase dashboard



\# App

PORT=3000

NODE\_ENV=production








\# WhatsApp (Phase 2 — leave blank for Phase 1)

\# WHATSAPP\_PHONE\_NUMBER\_ID=

\# WHATSAPP\_ACCESS\_TOKEN=

|<p>**Security Rule**</p><p>NEVER commit your .env file to GitHub. Add .env to your .gitignore immediately when you create the project. The SUPABASE\_SERVICE\_KEY bypasses Row Level Security — if it leaks, anyone can read all user data.</p>|
| :- |

### **lib/notifications.js — Push Sender (Backend)**
// Backend sends push notifications to user phones via Expo's servers

// Cost: FREE. No limits.



export async function sendPushNotification(pushToken, title, body, data = {}) {

`  `if (!pushToken) return;



`  `const message = {

`    `to: pushToken,

`    `sound: 'default',

`    `title,

`    `body,

`    `data,

`  `};



`  `await fetch('https://exp.host/--/api/v2/push/send', {

`    `method: 'POST',

`    `headers: {

`      `'Accept': 'application/json',

`      `'Accept-Encoding': 'gzip, deflate',

`      `'Content-Type': 'application/json',

`    `},

`    `body: JSON.stringify(message),

`  `});

}



// Specific notification formatters

export async function sendPaymentAlert(pushToken, tx) {

`  `const typeLabel = { till:'Till', paybill:'Paybill', pochi:'Pochi', p2p:'M-Pesa' }[tx.type];

`  `await sendPushNotification(

`    `pushToken,

`    ``💰 New ${typeLabel} payment`,

`    ``KES ${tx.amount.toLocaleString()} from ${tx.sender\_name || tx.sender\_phone}`,

`    `{ type: 'payment', transactionId: tx.id }

`  `);

}



export async function sendDailySummary(pushToken, summary) {

`  `await sendPushNotification(

`    `pushToken,

`    `'📊 WikTrack Daily Report',

`    ``Today: KES ${summary.totalIncome.toLocaleString()} · ${summary.txCount} payments`,

`    `{ type: 'daily\_summary', date: summary.date }

`  `);

}

### **jobs/dailySummary.js — 8PM Cron Job**
import cron from 'node-cron';

import { supabase } from '../lib/supabase.js';

import { sendDailySummary } from '../lib/notifications.js';



// Runs every day at 17:00 UTC = 20:00 EAT (Kenya time)

cron.schedule('0 17 \* \* \*', async () => {

`  `const today = new Date().toISOString().slice(0, 10);

`  `const todayStart = `${today}T00:00:00.000Z`;



`  `// Get all businesses with notifications enabled

`  `const { data: businesses } = await supabase

.from('businesses')

.select('id, owner\_phone, push\_token')

.eq('notifications', true)

.not('push\_token', 'is', null);



`  `for (const biz of businesses || []) {

`    `const { data: transactions } = await supabase

.from('transactions')

.select('amount, sender\_name')

.eq('business\_id', biz.id)

.gte('timestamp', todayStart);



`    `if (!transactions || transactions.length === 0) continue;



`    `// Find top sender

`    `const counts = {};

`    `transactions.forEach(t => {

`      `if (t.sender\_name) counts[t.sender\_name] = (counts[t.sender\_name] || 0) + 1;

`    `});

`    `const topSender = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];



`    `const summary = {

`      `date: today,

`      `totalIncome: transactions.reduce((s, t) => s + t.amount, 0),

`      `txCount: transactions.length,

`      `topSender,

`    `};



`    `await sendDailySummary(biz.push\_token, summary);

`  `}

});


# **PART 9 — DESIGN SYSTEM**

### **Color Tokens — src/theme/colors.js**
export const colors = {

`  `// Primary

`  `green:        '#16A34A',   // CTAs, income amounts, active nav

`  `greenDark:    '#0F8A3B',   // Hero card background (SOLID — no gradient)

`  `greenLight:   '#DCFCE7',   // Badge backgrounds, success states



`  `// Trust

`  `blue:         '#1E5A8A',   // Reports, Phase 2 features



`  `// Text

`  `navy:         '#0F172A',   // All primary text

`  `grayText:     '#64748B',   // Secondary text, captions, inactive tabs

`  `border:       '#E2E8F0',   // Card outlines, dividers



`  `// Surfaces

`  `white:        '#FFFFFF',

`  `background:   '#F8FAFC',



`  `// States

`  `orange:       '#EA580C',   // Expenses (Phase 2) — NEVER use green for expenses

`  `amber:        '#F59E0B',   // Trial warnings, upgrade CTAs

`  `red:          '#DC2626',   // Errors, sync failures



`  `// Transaction badge colors

`  `till:         '#15803D',   // text: green

`  `tillBg:       '#DCFCE7',

`  `paybill:      '#2563EB',   // text: blue

`  `paybillBg:    '#DBEAFE',

`  `pochi:        '#7C3AED',   // text: purple

`  `pochiBg:      '#EDE9FE',

`  `p2p:          '#0891B2',   // text: teal

`  `p2pBg:        '#ECFEFF',

};

### **Typography Rules**

|**Style**|**Size**|**Weight**|**Usage**|
| :- | :- | :- | :- |
|Display XL|44-52px|800|Hero income number on dashboard ONLY|
|Heading 1|28-32px|800|Screen titles|
|Heading 2|22-24px|700|Section titles within screens|
|Heading 3|18-20px|700|Card titles, group labels|
|Body L|16-18px|500|Important descriptions|
|Body M|14-16px|400-500|Standard body text, list items|
|Body S|12-14px|400-500|Captions, timestamps, badge text|
|Badge|12-13px|600|Transaction type badge labels|

### **Currency Formatting Rule — ALWAYS**
- Format: KES 12,450 — everywhere, no exceptions
- No decimal places in dashboard: KES 12,450 not KES 12,450.00
- Show decimals only in transaction detail if amount has cents
- Always bold currency values
- Never write Ksh. or KSh. — always KES

// src/lib/formatCurrency.js

export function formatKES(value) {

`  `return `KES ${Math.round(value).toLocaleString('en-KE')}`;

}

### **The 3 Navigation Tabs — Phase 1 Only**

|**Tab**|**Icon (Lucide)**|**What It Contains**|
| :- | :- | :- |
|Home|Wallet|Hero card, summary cards, 7-day chart, recent 5 transactions|
|Transactions|ReceiptText|Full list, search, filters by type + date, transaction detail|
|Settings|Settings2|Profile, sync toggle, payment type toggles, subscription/plan, support|

|<p>**No Expenses Tab in Phase 1**</p><p>Expenses, Reports, and Net Profit are all deferred to Phase 2. Do not build them in Phase 1. The app has 3 tabs only. Keep it simple for the informal market user who has never used a financial app before.</p>|
| :- |


# **PART 10 — SCREEN SPECIFICATIONS**

### **Onboarding Flow (5 Screens)**

|**Screen**|**Key Elements**|**Notes**|
| :- | :- | :- |
|O1 — Welcome|App name, tagline: 'Your M-Pesa income, tracked automatically', Get Started button|Green top 60%, white bottom sheet. Single CTA only.|
|O2 — Create Account|Phone number input, full name, business name, Create Account button|Phone is primary identifier. No email. No password — OTP only.|
|O3 — Payment Types|Checkboxes: Pochi, P2P (pre-selected), Till, Paybill|Pochi + P2P pre-selected — our primary market.|
|O4 — SMS Permission|Shield icon, 4 trust bullets, Allow button, Not now (ghost)|MOST CRITICAL SCREEN. If user taps Not Now, show banner on dashboard, never block.|
|O5 — First Sync|Progress bar, 'Found X M-Pesa messages', animation|This is the WOW moment. Show real progress count. Do not make it instant.|

### **Home Dashboard — Hero Card Rules**
- Background: solid #0F8A3B — NO gradient, NO background illustration, NO watermark chart
- All text white — income number is Display XL (44-52px, weight 800)
- Sync status dot inside the hero card — green pulsing dot + 'Synced 3 minutes ago'
- Tapping the card navigates to Transactions filtered to Today
- No Net Profit card in Phase 1 — expenses not tracked yet

### **Sync Status States**

|**State**|**Dot Color**|**Text**|**When**|
| :- | :- | :- | :- |
|Active / recent|Green #16A34A|Synced X minutes ago|Last sync within 30 minutes|
|Idle|Gray #94A3B8|Up to date|No new M-Pesa messages|
|Syncing|Amber pulsing|Syncing...|Active SMS scan in progress|
|Error|Red #DC2626|SMS access needed — tap to fix|Permission denied or revoked|
|Offline|Gray #94A3B8|No internet — data saved on phone|No data connection|

### **Empty States — Never Show a Blank Screen**

|**Context**|**Heading**|**Body**|**CTA**|
| :- | :- | :- | :- |
|No payments today|No payments yet today|New M-Pesa payments will appear here automatically.|Check sync settings|
|No filter results|No payments found|Try a different filter or date range.|Clear filters|
|SMS permission denied|SMS access needed|WikTrack needs to read M-Pesa messages to track your income.|Allow access|
|Offline|No internet connection|Your data is saved on this phone. It will sync when you are back online.|(none)|


# **PART 11 — SUBSCRIPTION MODEL**

|**Plan**|**Price**|**What They Get**|**Target User**|
| :- | :- | :- | :- |
|Free|KES 0|Basic dashboard, 30-day history, all 4 SMS types|Lead generation — gets them hooked on their own data|
|Starter|KES 299/mo|Full dashboard, push daily summary, 1-year history, export|Primary tier — Pochi + P2P users, mama mbogas, boda operators|
|Business|KES 699/mo|Everything + Business Income Report PDF, 2-user access, monthly comparison|Growing businesses needing accountant access or credit documentation|

### **Free Trial Logic**
- 7-day free trial on first install — full Starter features
- Day 5: push notification — 'Your trial ends in 2 days. Upgrade to keep your daily reports.'
- Day 7: push notification — 'Trial ends tomorrow.'
- Day 8: account downgrades to Free tier — 30-day history only
- Upgrade CTA copy: 'Upgrade to Starter — KES 299/mo. Less than a weekly data bundle.'

### **Subscription Card UI States**

|**State**|**Background**|**Primary Text**|**CTA**|
| :- | :- | :- | :- |
|Days 1-4 trial|Surface white|Free Trial — X days remaining|Upgrade to Starter — KES 299/mo|
|Days 5-7 trial|Amber light #FEF3C7|Trial ends in X days. Upgrade to keep your daily reports.|Upgrade Now — KES 299/mo|
|Trial expired|Red light|Your free trial has ended. Upgrade to continue.|Upgrade — KES 299/mo|
|Active Starter|Green light #DCFCE7|Starter Plan — KES 299/mo|Manage Plan|
|Active Business|Blue light #DBEAFE|Business Plan — KES 699/mo|Manage Plan|


# **PART 12 — BUILD ORDER (4 WEEKS)**

|<p>**The Golden Rule**</p><p>Build in this exact sequence. Each step gives you something working before you move on. Do not skip ahead. Do not build the UI before the parser works.</p>|
| :- |

### **Week 1 — The Core Engine**
Goal: App reads your own M-Pesa inbox and transactions appear in Supabase correctly.

- **Set up Supabase project. Run the full SQL schema from Part 4.**
- Write smsParser.js. Test all 4 regex patterns against real SMS samples from your own phone.
- Set up the Expo project with bare workflow. Install all dependencies.
- Add READ\_SMS permission to AndroidManifest.xml.
- Build useSmsSync hook. Test full loop: permission granted → read inbox → parse → Supabase insert.
- **SUCCESS CHECK: Open Supabase dashboard. Your own M-Pesa transactions appear in the transactions table.**

### **Week 2 — Dashboard UI**
Goal: You can show a complete stranger your dashboard and they understand it within 3 seconds.

- **Build HomeScreen: hero income card, sync status indicator, 2 summary cards, 7-day chart, last 5 transactions.**
- Build TransactionsScreen: full list, filter chips, search, date grouping.
- Build TransactionDetailScreen: all fields, share button, note input.
- Build OnboardingFlow: all 5 screens in order.
- Connect everything to Zustand store. Test state persists across app restarts.
- **SUCCESS CHECK: Build APK and install on your own phone as a clean user (not dev mode). Fix everything that breaks.**

### **Week 3 — Backend + Notifications**
Goal: At 8PM you receive a push notification showing your day's income from WikTrack.

- **Set up Express backend on Vercel. Connect to Supabase with service role key.**
- Add expo-notifications to app. Request permission in onboarding. Save push token to Supabase.
- Write sendPushNotification() function in backend.
- Build the 8PM daily summary cron job.
- Test: temporarily change cron schedule to every 5 minutes. Confirm you receive push notifications.
- **SUCCESS CHECK: Receive real push notification at 8PM with your day's M-Pesa income.**

### **Week 4 — Polish + First Real Users**
Goal: 3 real clients have WikTrack installed and are receiving their daily push summary.

- **Build SettingsScreen: profile edit, sync toggle, payment type toggles, subscription card.**
- Add all empty states, loading skeletons, and error states.
- Run eas build --profile preview --platform android. Download the APK.
- Install on 3 agency client phones during your field visits. Watch them use it.
- Write down every question they ask. Fix the top 3 things they were confused about.
- **Rebuild APK. Reinstall. Enrol them in push summary.**
- **SUCCESS CHECK: 3 real people receive their 8PM push notification and tap it to open the app.**


# **PART 13 — SECURITY CHECKLIST**

|**Rule**|**Why**|**How to Implement**|
| :- | :- | :- |
|Use Supabase Row Level Security (RLS)|Prevents users seeing other businesses data|Already included in SQL schema — DO NOT disable|
|Service role key on backend ONLY|Anon key in app cannot bypass RLS|SUPABASE\_SERVICE\_KEY in backend .env only — anon key in app|
|Never store raw SMS content|Raw SMS may contain sensitive personal data|Store SHA256(rawSms) as sms\_hash for deduplication only|
|Add .env to .gitignore immediately|Prevent secrets being pushed to GitHub|First thing you do after creating the project|
|Never commit API keys to GitHub|Public repos are crawled by bots within minutes|Use environment variables for all sensitive values|

# **PART 14 — WHAT NOT TO BUILD IN PHASE 1**

**These are explicit decisions — not oversights. Do not build any of these until you have 50+ active daily users.**

|**Feature**|**Decision**|**Reason**|**When**|
| :- | :- | :- | :- |
|Expense tracking|DEFERRED|Too much friction for informal market. Nobody logs expenses daily.|Phase 2 — Business tier|
|Net Profit card|DEFERRED|Requires reliable expense data. Circular dependency.|Phase 2 after expenses added|
|Play Store listing|DEFERRED|READ\_SMS exception takes 3-7 weeks to approve. APK is faster.|Month 3+ when 30+ users|
|WhatsApp messaging|DEFERRED|Push notifications cover Phase 1 at zero cost.|Phase 2 — Meta Cloud API|
|iOS version|EXCLUDED|iOS has no READ\_SMS equivalent. Technically impossible.|Never — Android only|
|PWA web companion|DEFERRED|Phase 2 Business tier for accountants.|Phase 2|
|Profit/Loss report PDF|DEFERRED|Requires expenses to be meaningful.|Phase 2|
|Dark mode|EXCLUDED|Doubles design + QA effort. Target users are outdoors.|Phase 2 roadmap|
|5-tab navigation|EXCLUDED|3 tabs only in Phase 1. Expenses + Reports tabs added later.|Phase 2|


# **PART 15 — QUICK REFERENCE**

### **Key URLs and Services**

|**Service**|**URL**|**What You Do There**|
| :- | :- | :- |
|Supabase|supabase.com|Create project, run SQL schema, view data, manage auth|
|Vercel|vercel.com|Deploy backend server, set environment variables, view logs|
|Expo / EAS|expo.dev|Build APK, manage builds, download APK files|
|Meta for Developers|developers.facebook.com|WhatsApp Cloud API setup (Phase 2)|
|IntaSend / Pesapal|intasend.com / pesapal.com|M-Pesa payment gateway for subscription billing|
|Vercel|vercel.com|Deploy PWA web companion for accountants (Phase 2)|

### **Push Notification Formats**

|**Trigger**|**Title**|**Body**|
| :- | :- | :- |
|New Pochi payment|💰 New Pochi payment|KES 500 from John Kamau|
|New Till payment|💰 New Till payment|KES 1,200 from Mary W.|
|Daily 8PM summary|📊 WikTrack Daily Report|Today: KES 12,450 · 23 payments|
|Trial ending day 5|⏰ Trial ending soon|Your trial ends in 2 days — upgrade to keep your data|
|Trial expired|🔒 Trial ended|Upgrade to Starter to continue|
|Sync error|⚠️ Sync issue|WikTrack hasn't synced — tap to fix|

### **M-Pesa SMS Parser — What Each Regex Captures**

|**Type**|**match[1]**|**match[2]**|**match[3]**|**match[4]**|**match[5]**|**match[6]**|
| :- | :- | :- | :- | :- | :- | :- |
|Till|amount|senderName|senderPhone|date|time|balance|
|Paybill|amount|senderName|senderPhone|accountRef|date|time (balance=match[7])|
|Pochi|amount|senderName|senderPhone|date|time|balance|
|P2P|amount|senderPhone\*|senderName\*|date|time|balance|

\* P2P format has phone BEFORE name — note the swapped positions in match[2] and match[3]

### **Supabase — Common Queries You Will Use**
// Get today's total income for a business

const { data } = await supabase

.from('transactions')

.select('amount, type')

.eq('business\_id', businessId)

.gte('timestamp', todayStart);

const todayTotal = data?.reduce((s, t) => s + t.amount, 0) ?? 0;



// Get last 20 transactions (most recent first)

const { data } = await supabase

.from('transactions')

.select('\*')

.eq('business\_id', businessId)

.order('timestamp', { ascending: false })

.limit(20);



// Filter by payment type

const { data } = await supabase

.from('transactions')

.select('\*')

.eq('business\_id', businessId)

.eq('type', 'pochi');   // or 'till', 'paybill', 'p2p'



// Search by sender name

const { data } = await supabase

.from('transactions')

.select('\*')

.eq('business\_id', businessId)

.ilike('sender\_name', `%${searchTerm}%`);



// 7-day chart data

const { data } = await supabase

.from('transactions')

.select('amount, timestamp')

.eq('business\_id', businessId)

.gte('timestamp', weekAgoISO)

.order('timestamp', { ascending: true });

|<p>**The Most Important Reminder**</p><p>Build the SMS parser first. Get it reading your own M-Pesa inbox. Get your own transactions appearing in Supabase. Everything else — the dashboard, notifications, backend, APK — builds on top of that one working foundation. Start there. Ship it. Kenya is waiting.</p>|
| :- |

*WikTrack — Built for Kenya's Invisible Economy*
