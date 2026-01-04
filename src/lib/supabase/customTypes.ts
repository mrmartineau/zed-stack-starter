import type { Database } from './supabase'

export type UserProfile = Database['public']['Tables']['users']['Row']
