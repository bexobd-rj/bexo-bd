require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const payload = { profileId: 'BX-123456', fullName: 'Test' };
  const { data, error } = await sb.from('bexo_users').upsert(payload, { onConflict: 'profileId' });
  console.log("Upsert Error:", error);
}
run();
