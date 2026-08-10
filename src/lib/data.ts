// Trackstack data layer — via Vercel Function proxy
// api/proxy.ts handles server-side → Supabase, zero CORS

async function req(path: string, method: string, body?: any) {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('sb_token')
  if (token) headers['Authorization'] = 'Bearer ' + token
  if (body) headers['Content-Type'] = 'application/json'

  try {
    const r = await fetch('/api/proxy' + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
    if (!r.ok) return method === 'GET' ? [] : null
    return r.json()
  } catch {
    return method === 'GET' ? [] : null
  }
}

function get(path: string) { return req(path, 'GET') }
function post(path: string, body: any) { return req(path, 'POST', body) }
function del(path: string) { return req(path, 'DELETE') }

function uid(): string {
  const token = localStorage.getItem('sb_token')
  if (!token) return 'anon'
  try {
    return JSON.parse(atob(token.split('.')[1])).sub || 'anon'
  } catch { return 'anon' }
}

const u = () => uid()

export async function getTeam() {
  const data = await get('/team_members?select=team_id&user_id=eq.' + u() + '&limit=1')
  if (!data?.length) return null
  const teams = await get('/teams?select=*&id=eq.' + data[0].team_id)
  return teams?.[0] || null
}
export async function getTeamMembers(teamId: string) { return get('/team_members?select=*&team_id=eq.' + teamId) }
export async function createTeam(name: string): Promise<{ error?: string }> {
  const r = await post('/teams', { name, owner_id: u() })
  if (!r?.[0]) return { error: 'Failed to create team' }
  const team = r[0]
  await post('/team_members', { team_id: team.id, user_id: u(), role: 'admin' })
  await post('/settings', { user_id: u(), team_id: team.id })
  return {}
}
export async function removeMember(teamId: string, userId: string) {
  return del('/team_members?team_id=eq.' + teamId + '&user_id=eq.' + userId)
}

export async function getAssets() { return get('/assets?select=*&user_id=eq.' + u() + '&order=created_at.desc') }
export async function saveAsset(a: any) { return post('/assets', { ...a, user_id: u() }) }
export async function deleteAsset(id: string) { return del('/assets?id=eq.' + id) }
export async function getCerts() { return get('/certificates?select=*&user_id=eq.' + u() + '&order=created_at.desc') }
export async function saveCert(c: any) { return post('/certificates', { ...c, user_id: u() }) }
export async function deleteCert(id: string) { return del('/certificates?id=eq.' + id) }
export async function getEmployees() { return get('/employees?select=*&user_id=eq.' + u() + '&order=name') }
export async function saveEmployee(e: any) { return post('/employees', { ...e, user_id: u() }) }
export async function deleteEmployee(id: string) { return del('/employees?id=eq.' + id) }
export async function getSettings() { const r = await get('/settings?select=*&user_id=eq.' + u() + '&limit=1'); return r?.[0] || {} }
export async function saveSettings(s: any) { return post('/settings', { ...s, user_id: u() }) }
