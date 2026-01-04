import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey
)
