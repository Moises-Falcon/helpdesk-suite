// src/lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Esto ayuda muchísimo cuando la env var no está cargando
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url!, anon!, {
  auth: {
    persistSession: false, // usamos nuestro storage manual (session.ts)
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
