import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://odqkhlcpfgbfexqcspbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcWtobGNwZmdiZmV4cWNzcGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDA1MjUsImV4cCI6MjA5NDAxNjUyNX0.Ngl1RTl3lY2xzM2o7I_HBv8Jg6TMgRhzRSYoDkXk5aA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
