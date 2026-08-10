// Trackstack data layer — API key in URL, zero CORS issues
const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

function api(path: string) {
  const sep = path.includes('?') ? '&' : '?'
  return U + path + sep + 'apikey=' + K
}

function withAuth() {
  const token = localStorage.getItem('sb_token')
  if (!token) return ''
  return '&Authorization=Bearer%20' + encodeURIComponent(token)
}

async function get(path: string) {
  const url = api(path) + withAuth()
  const r = await fetch(url)
  if (!r.ok) return []
  return r.json()
}

async function post(path: string, body: any) {
  const url = api(path) + withAuth()
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function del(path: string) {
  const url = api(path) + withAuth()
  await fetch(url, { method: 'DELETE' })
}

export async function getAssets() { return get('/rest/v1/assets?select=*&order=created_at.desc') }
export async function saveAsset(a: any) { return post('/rest/v1/assets', a) }
export async function deleteAsset(id: string) { return del('/rest/v1/assets?id=eq.' + id) }
export async function getCerts() { return get('/rest/v1/certificates?select=*&order=created_at.desc') }
export async function saveCert(c: any) { return post('/rest/v1/certificates', c) }
export async function deleteCert(id: string) { return del('/rest/v1/certificates?id=eq.' + id) }
export async function getEmployees() { return get('/rest/v1/employees?select=*&order=name') }
export async function saveEmployee(e: any) { return post('/rest/v1/employees', e) }
export async function deleteEmployee(id: string) { return del('/rest/v1/employees?id=eq.' + id) }
export async function getSettings() { const r = await get('/rest/v1/settings?select=*&limit=1'); return r?.[0] || {} }
export async function saveSettings(s: any) { return post('/rest/v1/settings', s) }

export async function getTeam() {
  const data = await get('/rest/v1/team_members?select=team_id&limit=1')
  if (!data?.length) return null
  const teams = await get('/rest/v1/teams?select=*&id=eq.' + data[0].team_id)
  return teams?.[0] || null
}
export async function getTeamMembers(teamId: string) { return get('/rest/v1/team_members?select=*&team_id=eq.' + teamId) }
export async function createTeam(name: string): Promise<{ error?: string }> {
  const url = api('/rest/v1/teams') + withAuth()
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, owner_id: 'me' })
  })
  if (!r.ok) return { error: 'Failed to create team' }
  const [team] = await r.json()
  await post('/rest/v1/team_members', { team_id: team.id, user_id: 'me', role: 'admin' })
  await post('/rest/v1/settings', { user_id: 'me', team_id: team.id })
  return {}
}
export async function removeMember(teamId: string, userId: string) {
  return del('/rest/v1/team_members?team_id=eq.' + teamId + '&user_id=eq.' + userId)
}
