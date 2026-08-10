// Supabase auth — real auth, email verification, session management
'use client'
import { supabase } from './supabase/client'

export type { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  return {}
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message.includes('Invalid login')) return { error: 'Invalid email or password.' }
    return { error: error.message }
  }
  return {}
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || null
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthChange(callback: (user: string | null) => void) {
  supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user?.email || null)
  })
}
