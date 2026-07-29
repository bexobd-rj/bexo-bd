import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingKeys = [];
  if (!supabaseUrl) missingKeys.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missingKeys.push('VITE_SUPABASE_ANON_KEY');
  
  throw new Error(
    `Supabase Initialization Failed: Missing environment variable(s) [${missingKeys.join(', ')}]. ` +
    `Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

