import { createClient } from '@supabase/supabase-js'

// These lines read the keys you just put in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This exports the "connection" so other files can use it
export const supabase = createClient(supabaseUrl, supabaseKey)