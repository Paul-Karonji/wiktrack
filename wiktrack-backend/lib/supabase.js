import { createClient } from '@supabase/supabase-js';

// SERVICE ROLE KEY — bypasses RLS. NEVER expose this in the app.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default supabase;
