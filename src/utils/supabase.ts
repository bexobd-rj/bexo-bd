import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qptxwbhzpkpmqjrvouea.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_l4y3anN2nbBE5tQWF_AELg__fTVRIr3';

export const supabase = createClient(supabaseUrl, supabaseKey);
