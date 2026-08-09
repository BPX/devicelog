// Demo auth — works without Supabase. Uses localStorage.
// Swap to real Supabase auth by changing createClient() in production.

const DEMO_KEY = 'trackstack_demo'

interface DemoUser {
  email: string
  password: string
  createdAt: string
}

function getUsers(): Record<string, DemoUser> {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY + '_users') || '{}') } catch { return {} }
}

function saveUsers(users: Record<string, DemoUser>) {
  localStorage.setItem(DEMO_KEY + '_users', JSON.stringify(users))
}

export function getCurrentUser(): string | null {
  return localStorage.getItem(DEMO_KEY + '_session')
}

export function signUp(email: string, password: string): { error?: string } {
  const users = getUsers()
  if (users[email]) return { error: 'An account with this email already exists.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }
  users[email] = { email, password, createdAt: new Date().toISOString() }
  saveUsers(users)
  localStorage.setItem(DEMO_KEY + '_session', email)
  return {}
}

export function signIn(email: string, password: string): { error?: string } {
  const users = getUsers()
  const user = users[email]
  if (!user) return { error: 'No account found with this email. Create one first.' }
  if (user.password !== password) return { error: 'Incorrect password. Try again.' }
  localStorage.setItem(DEMO_KEY + '_session', email)
  return {}
}

export function signOut() {
  localStorage.removeItem(DEMO_KEY + '_session')
}
