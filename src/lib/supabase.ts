import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
// Try both the correct name and the potentially typoed names from the screenshot
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_I || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KE || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  if (process.env.SUPABASE_SERVICE_I) {
    console.log('Detected SUPABASE_SERVICE_I secret, using it as service key.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

export const checkSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      valid: false,
      error: 'Supabase configuration is missing. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly in the Secrets panel.'
    };
  }
  return { valid: true };
};
