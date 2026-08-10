// Direct Supabase data layer — no client library, no CORS issues
const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

function authHeaders() {
  const token = localStorage.getItem('sb_token')
  const h: Record<string, string> = { apikey: K }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function postHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' }
}

async function get(path: string) {
  const r = await fetch(U + path, { headers: authHeaders() })
  if (!r.ok) return []
  return r.json()
}

async function post(path: string, body: any) {
  await fetch(U + path, {
    method: 'POST', headers: postHeaders(), body: JSON.stringify(body)
  })
}

async function del(path: string) {
  await fetch(U + path, { method: 'DELETE', headers: authHeaders() })
}

// ---- ASSETS ----
export async function getAssets() { return get('/rest/v1/assets?select=*&order=created_at.desc') }
export async function saveAsset(a: any) { return post('/rest/v1/assets', a) }
export async function deleteAsset(id: string) { return del('/rest/v1/assets?id=eq.' + id) }

// ---- CERTIFICATES ----
export async function getCerts() { return get('/rest/v1/certificates?select=*&order=created_at.desc') }
export async function saveCert(c: any) { return post('/rest/v1/certificates', c) }
export async function deleteCert(id: string) { return del('/rest/v1/certificates?id=eq.' + id) }

// ---- EMPLOYEES ----
export async function getEmployees() { return get('/rest/v1/employees?select=*&order=name') }
export async function saveEmployee(e: any) { return post('/rest/v1/employees', e) }
export async function deleteEmployee(id: string) { return del('/rest/v1/employees?id=eq.' + id) }

// ---- SETTINGS ----
export async function getSettings() {
  const r = await get('/rest/v1/settings?select=*&limit=1')
  return r?.[0] || { categories: ['laptop','desktop','monitor'], statuses: ['active','maintenance','retired','lost'], cert_types: ['ssl_cert','software_license'] }
}
export async function saveSettings(s: any) { return post('/rest/v1/settings', s) }

// ---- TEAMS ----
export async function getTeam() {
  const data = await get('/rest/v1/team_members?select=team_id&limit=1')
  if (!data?.length) return null
  const teams = await get('/rest/v1/teams?select=*&id=eq.' + data[0].team_id)
  return teams?.[0] || null
}
export async function getTeamMembers(teamId: string) {
  return get('/rest/v1/team_members?select=*&team_id=eq.' + teamId)
}
export async function createTeam(name: string): Promise<{ error?: string }> {
  const r = await fetch(U + '/rest/v1/teams', {
    method: 'POST', headers: { ...postHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify({ name, owner_id: 'me' })
  })
  if (!r.ok) return { error: 'Failed to create team' }
  const [team] = await r.json()
  // Add self as admin
  await post('/rest/v1/team_members', { team_id: team.id, user_id: 'me', role: 'admin' })
  // Create default settings
  await post('/rest/v1/settings', { user_id: 'me', team_id: team.id })
  return {}
}
export async function removeMember(teamId: string, userId: string) {
  return del('/rest/v1/team_members?team_id=eq.' + teamId + '&user_id=eq.' + userId)
}
