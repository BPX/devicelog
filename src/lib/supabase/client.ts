// Supabase client for browser-side usage
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
