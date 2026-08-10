// Supabase auth — direct API calls, no library issues on Vercel
'use client'

const SUPABASE_URL = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

const headers = { apikey: ANON_KEY, 'Content-Type': 'application/json' }

export async function signUp(email: string, password: string): Promise<{ error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST', headers,
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const { msg } = await res.json()
    return { error: msg || 'Signup failed' }
  }
  return {}
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers,
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const { error_description } = await res.json()
    return { error: error_description || 'Invalid login' }
  }
  const { access_token, refresh_token } = await res.json()
  localStorage.setItem('sb_token', access_token)
  localStorage.setItem('sb_refresh', refresh_token)
  return {}
}

export async function signOut() {
  localStorage.removeItem('sb_token')
  localStorage.removeItem('sb_refresh')
  // Also call Supabase to revoke
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST', headers: { ...headers, Authorization: `Bearer ${localStorage.getItem('sb_token')}` }
  })
}

export async function getCurrentUser(): Promise<string | null> {
  const token = localStorage.getItem('sb_token')
  if (!token) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { ...headers, Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const { email } = await res.json()
    return email || null
  } catch { return null }
}
