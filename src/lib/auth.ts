'use client'

import { supabase } from './supabase/client'

const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const REST = U + '/rest/v1'
export const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

// Resolve username → email (localStorage first, then API)
async function resolveEmail(username: string): Promise<string | null> {
  // Fast path: check localStorage from signup/login
  const storedUser = localStorage.getItem('sb_username')
  const storedEmail = localStorage.getItem('sb_email')
  if (storedUser === username && storedEmail) return storedEmail

  // API fallback: query user_profiles table
  try {
    const r = await window.fetch(
      REST + '/user_profiles?select=email&username=eq.' + encodeURIComponent(username),
      { headers: { apikey: K } }
    )
    if (!r.ok) return null
    const data = await r.json()
    return data?.[0]?.email || null
  } catch { return null }
}

export async function signUp(email: string, password: string, username?: string) {
  const body: any = { email, password }
  if (username) body.data = { username }

  const r = await window.fetch(U + '/auth/v1/signup', {
    method: 'POST',
    headers: { apikey: K, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) { const j = await r.json(); return { error: j.msg || 'Signup failed' } }
  const j = await r.json()
  
  // Save username immediately (works even with email confirmation)
  if (username) {
    localStorage.setItem('sb_username', username)
    localStorage.setItem('sb_email', email)
  }
  
  if (j.access_token) {
    localStorage.setItem('sb_token', j.access_token)
    localStorage.setItem('sb_refresh', j.refresh_token || '')
    localStorage.setItem('sb_email', email)
    if (username) localStorage.setItem('sb_username', username)

    // Sync session to Supabase SDK
    await supabase.auth.setSession({ access_token: j.access_token, refresh_token: j.refresh_token || '' })
    
    // Insert into user_profiles for login lookup
    if (username) {
      try {
        const userId = j.user?.id || JSON.parse(atob(j.access_token.split('.')[1])).sub
        await window.fetch(REST + '/user_profiles', {
          method: 'POST',
          headers: {
            apikey: K,
            'Authorization': 'Bearer ' + j.access_token,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ user_id: userId, username, email }),
        })
      } catch { /* non-critical */ }
    }
  }
  return {}
}

export async function signIn(login: string, password: string) {
  // If no '@', treat as username → resolve to email
  let email = login
  if (!login.includes('@')) {
    const resolved = await resolveEmail(login)
    if (!resolved) return { error: 'Username not found' }
    email = resolved
  }

  const r = await window.fetch(U + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: K, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) { const j = await r.json(); return { error: j.error_description || 'Invalid email or password' } }
  const j = await r.json()
  localStorage.setItem('sb_token', j.access_token)
  localStorage.setItem('sb_refresh', j.refresh_token || '')
  localStorage.setItem('sb_email', email)

  // Sync session to Supabase SDK so client components can use supabase.from()
  await supabase.auth.setSession({ access_token: j.access_token, refresh_token: j.refresh_token || '' })
  
  // Username — try user_metadata first, then user_profiles
  const metaUser = j.user?.user_metadata?.username
  if (metaUser) {
    localStorage.setItem('sb_username', metaUser)
    // Backfill user_profiles so username login works
    try {
      const userId = j.user?.id || JSON.parse(atob(j.access_token.split('.')[1])).sub
      // Upsert: insert if not exists
      await window.fetch(REST + '/user_profiles', {
        method: 'POST',
        headers: {
          apikey: K,
          'Authorization': 'Bearer ' + j.access_token,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({ user_id: userId, username: metaUser, email }),
      })
    } catch { /* non-critical */ }
  } else {
    try {
      const userId = j.user?.id || ''
      const r2 = await window.fetch(
        REST + '/user_profiles?select=username&user_id=eq.' + userId,
        { headers: { apikey: K, 'Authorization': 'Bearer ' + j.access_token } }
      )
      const profiles = await r2.json()
      if (profiles?.[0]?.username) {
        localStorage.setItem('sb_username', profiles[0].username)
      }
    } catch { /* non-critical */ }
  }

  return {}
}

export async function signOut() {
  localStorage.removeItem('sb_token')
  localStorage.removeItem('sb_refresh')
  localStorage.removeItem('sb_email')
  localStorage.removeItem('sb_username')
}

export function getCurrentUser(): string | null {
  return localStorage.getItem('sb_email')
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem('sb_username')
}
