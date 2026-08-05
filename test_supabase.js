import { createClient } from '@supabase/supabase-js';
const sb = createClient('qptxwbhzpkpmqjrvouea.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');
sb.auth.signInWithOtp({ email: 'test@example.com' }).then(res => console.log(res.error.message)).catch(err => console.log('Err:', err));
