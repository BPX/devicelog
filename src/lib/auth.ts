'use client'

const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

export async function signUp(email: string, password: string) {
  const r = await window.fetch(U + '/auth/v1/signup', {
    method: 'POST',
    headers: { apikey: K, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!r.ok) { const j = await r.json(); return { error: j.msg || 'Signup failed' } }
  // Store email immediately so getCurrentUser works
  const j = await r.json()
  if (j.access_token) {
    localStorage.setItem('sb_token', j.access_token)
    localStorage.setItem('sb_refresh', j.refresh_token || '')
    localStorage.setItem('sb_email', email)
  }
  return {}
}

export async function signIn(email: string, password: string) {
  const r = await window.fetch(U + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: K, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!r.ok) { const j = await r.json(); return { error: j.error_description || 'Invalid email or password' } }
  const j = await r.json()
  localStorage.setItem('sb_token', j.access_token)
  localStorage.setItem('sb_refresh', j.refresh_token || '')
  localStorage.setItem('sb_email', email)
  return {}
}

export async function signOut() {
  localStorage.removeItem('sb_token')
  localStorage.removeItem('sb_refresh')
  localStorage.removeItem('sb_email')
}

// No API call needed — just check localStorage
export function getCurrentUser(): string | null {
  return localStorage.getItem('sb_email')
}
