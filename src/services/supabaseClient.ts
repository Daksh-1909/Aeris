import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, publishableKey, url } from './supabaseConfig';

export { isSupabaseConfigured } from './supabaseConfig';
export const supabase = isSupabaseConfigured && url && publishableKey
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
