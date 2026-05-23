-- Supabase Database Migration v2
-- Run this in your Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- 1. Update transactions check constraint to allow new transaction types
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('till','paybill','pochi','p2p','withdrawal','fuliza','repayment'));

-- 2. Add flow and network columns with default fallback values
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS flow TEXT NOT NULL DEFAULT 'in' CHECK (flow IN ('in', 'out'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'mpesa' CHECK (network IN ('mpesa', 'airtel'));

-- 3. Add Fuliza tracking columns
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fuliza_amount NUMERIC(12,2) DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS outstanding_fuliza NUMERIC(12,2) DEFAULT NULL;

-- 4. Create the recipient_mappings table
CREATE TABLE IF NOT EXISTS recipient_mappings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  recipient   TEXT NOT NULL,
  custom_name TEXT,
  category    TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, recipient)
);

-- 5. Enable Row-Level Security for recipient_mappings
ALTER TABLE recipient_mappings ENABLE ROW LEVEL SECURITY;

-- 6. Add Row-Level Security policy for recipient_mappings
DROP POLICY IF EXISTS "own recipient_mappings only" ON recipient_mappings;
CREATE POLICY "own recipient_mappings only" ON recipient_mappings
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- 7. Add index for performance
CREATE INDEX IF NOT EXISTS idx_recipient_mappings_business ON recipient_mappings(business_id);
