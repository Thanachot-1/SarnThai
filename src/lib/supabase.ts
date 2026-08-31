import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project-ref')
);

// If keys are provided, initialize real client. Otherwise, return null or safe fallback client.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '💡 [SarnThai] ยังไม่ได้เชื่อมต่อ Supabase Keys ในไฟล์ .env ระบบจะใช้ Local Database Storage ในเครื่องจนกว่าจะระบุ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY'
  );
}
