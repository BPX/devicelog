// Trackstack data layer — no Authorization header, no CORS
// Uses user UUID from decoded JWT to filter queries
const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

function userId(): string {
  const token = localStorage.getItem('sb_token')
  if (!token) return '00000000-0000-0000-0000-000000000000'
  try {
    // JWT payload is the middle base64 part
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || 'anon'
  } catch { return 'anon' }
}

function api(path: string) {
  const sep = path.includes('?') ? '&' : '?'
  return U + path + sep + 'apikey=' + K
}

async function get(path: string) {
  const r = await fetch(api(path))
  if (!r.ok) return []
  return r.json()
}

async function post(path: string, body: any) {
  // POST needs Authorization in header, but we put apikey in URL
  const token = localStorage.getItem('sb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  await fetch(api(path), { method: 'POST', headers, body: JSON.stringify(body) })
}

async function del(path: string) {
  await fetch(api(path), { method: 'DELETE' })
}

const uid = () => userId()

// Filter by user_id — no RLS needed
export async function getAssets() { return get('/rest/v1/assets?select=*&user_id=eq.' + uid() + '&order=created_at.desc') }
export async function saveAsset(a: any) { return post('/rest/v1/assets', { ...a, user_id: uid() }) }
export async function deleteAsset(id: string) { return del('/rest/v1/assets?id=eq.' + id) }
export async function getCerts() { return get('/rest/v1/certificates?select=*&user_id=eq.' + uid() + '&order=created_at.desc') }
export async function saveCert(c: any) { return post('/rest/v1/certificates', { ...c, user_id: uid() }) }
export async function deleteCert(id: string) { return del('/rest/v1/certificates?id=eq.' + id) }
export async function getEmployees() { return get('/rest/v1/employees?select=*&user_id=eq.' + uid() + '&order=name') }
export async function saveEmployee(e: any) { return post('/rest/v1/employees', { ...e, user_id: uid() }) }
export async function deleteEmployee(id: string) { return del('/rest/v1/employees?id=eq.' + id) }
export async function getSettings() { const r = await get('/rest/v1/settings?select=*&user_id=eq.' + uid() + '&limit=1'); return r?.[0] || {} }
export async function saveSettings(s: any) { return post('/rest/v1/settings', { ...s, user_id: uid() }) }

export async function getTeam() {
  const data = await get('/rest/v1/team_members?select=team_id&user_id=eq.' + uid() + '&limit=1')
  if (!data?.length) return null
  const teams = await get('/rest/v1/teams?select=*&id=eq.' + data[0].team_id)
  return teams?.[0] || null
}
export async function getTeamMembers(teamId: string) { return get('/rest/v1/team_members?select=*&team_id=eq.' + teamId) }
export async function createTeam(name: string): Promise<{ error?: string }> {
  const token = localStorage.getItem('sb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Prefer: 'return=representation' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const r = await fetch(api('/rest/v1/teams'), {
    method: 'POST', headers,
    body: JSON.stringify({ name, owner_id: uid() })
  })
  if (!r.ok) return { error: 'Failed to create team' }
  const [team] = await r.json()
  await post('/rest/v1/team_members', { team_id: team.id, user_id: uid(), role: 'admin' })
  await post('/rest/v1/settings', { user_id: uid(), team_id: team.id })
  return {}
}
export async function removeMember(teamId: string, userId: string) {
  return del('/rest/v1/team_members?team_id=eq.' + teamId + '&user_id=eq.' + userId)
}
