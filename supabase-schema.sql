-- WikTrack Supabase Schema
-- Run this ONCE in the Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- This creates your entire database structure for Phase 1.

-- ============================================================
-- Table 1 — businesses
-- One row per business owner using WikTrack.
-- ============================================================
CREATE TABLE businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  owner_phone     TEXT NOT NULL,
  shortcode       TEXT,
  business_type   TEXT,
  county          TEXT,
  enabled_types   TEXT[] DEFAULT ARRAY['till','paybill','pochi','p2p'],
  push_token      TEXT,
  notifications   BOOLEAN DEFAULT TRUE,
  alert_time      TIME DEFAULT '20:00',
  plan            TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMP,
  trial_started   TIMESTAMP DEFAULT NOW(),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Table 2 — transactions
-- One row per M-Pesa payment received.
-- Deduplication enforced by UNIQUE on sms_hash.
-- ============================================================
CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('till','paybill','pochi','p2p')),
  amount        NUMERIC(12,2) NOT NULL,
  sender_name   TEXT,
  sender_phone  TEXT,
  account_ref   TEXT,
  mpesa_code    TEXT UNIQUE,
  sms_hash      TEXT UNIQUE,
  timestamp     TIMESTAMP NOT NULL,
  source        TEXT DEFAULT 'sms' CHECK (source = 'sms'),
  shortcode     TEXT,
  balance       NUMERIC(12,2),
  note          TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Table 3 — expenses (Phase 2 — create now, don't use yet)
-- ============================================================
CREATE TABLE expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Table 4 — daily_summaries (performance cache)
-- ============================================================
CREATE TABLE daily_summaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  total_income    NUMERIC(12,2) DEFAULT 0,
  total_expenses  NUMERIC(12,2) DEFAULT 0,
  tx_count        INTEGER DEFAULT 0,
  top_sender      TEXT,
  UNIQUE(business_id, date)
);

-- ============================================================
-- Table 5 - failed_parses
-- Dead-letter queue for MPESA SMS formats the parser did not recognize.
-- ============================================================
CREATE TABLE failed_parses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  sender          TEXT,
  raw_sms         TEXT NOT NULL,
  sms_hash        TEXT UNIQUE NOT NULL,
  received_at     TIMESTAMP,
  parser_version  TEXT NOT NULL,
  error           TEXT,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Indexes for query performance
-- ============================================================
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_timestamp   ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_type        ON transactions(type);
CREATE INDEX idx_expenses_business_id     ON expenses(business_id);
CREATE INDEX idx_businesses_shortcode     ON businesses(shortcode);
CREATE INDEX idx_businesses_user_id       ON businesses(user_id);
CREATE INDEX idx_failed_parses_business_id ON failed_parses(business_id);
CREATE INDEX idx_failed_parses_resolved    ON failed_parses(resolved);

-- ============================================================
-- Row Level Security — users can ONLY see their own data
-- ============================================================
ALTER TABLE businesses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_parses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own business only" ON businesses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own transactions only" ON transactions
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "own expenses only" ON expenses
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "own summaries only" ON daily_summaries
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "own failed parses only" ON failed_parses
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );
