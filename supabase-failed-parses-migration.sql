-- Add the parser dead-letter queue to an existing WikTrack Supabase project.

CREATE TABLE IF NOT EXISTS failed_parses (
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

CREATE INDEX IF NOT EXISTS idx_failed_parses_business_id ON failed_parses(business_id);
CREATE INDEX IF NOT EXISTS idx_failed_parses_resolved    ON failed_parses(resolved);

ALTER TABLE failed_parses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'failed_parses'
      AND policyname = 'own failed parses only'
  ) THEN
    CREATE POLICY "own failed parses only" ON failed_parses
      FOR ALL USING (
        business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
      );
  END IF;
END $$;
