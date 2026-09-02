const { createClient } = require('@supabase/supabase-js');
console.log(Object.keys(createClient('https://xyz.supabase.co', 'xyz').auth));
