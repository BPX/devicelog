// Unified data store — Supabase when available, localStorage fallback
// Once Supabase migration SQL is run, data auto-syncs to the cloud

const SUPABASE_READY = true // Flip to false to use localStorage-only

// ---- Fallback to localStorage ----
function localGet(key: string) { try { return JSON.parse(localStorage.getItem('trackstack_' + key) || '[]') } catch { return [] } }
function localSet(key: string, data: any) { localStorage.setItem('trackstack_' + key, JSON.stringify(data)) }

// ---- Assets ----
export async function getAssets() {
  if (!SUPABASE_READY) return localGet('assets')
  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false })
    return data || []
  } catch { return localGet('assets') }
}

export async function saveAsset(asset: Record<string, any>) {
  localSet('assets', [...localGet('assets').filter((a: any) => a.id !== asset.id), asset])
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    await supabase.from('assets').upsert(asset, { onConflict: 'id' })
  } catch {}
}

export async function deleteAsset(id: string) {
  localSet('assets', localGet('assets').filter((a: any) => a.id !== id))
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    await supabase.from('assets').delete().eq('id', id)
  } catch {}
}

// ---- Certificates ----
export async function getCerts() {
  if (!SUPABASE_READY) return localGet('certificates')
  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
    return data || []
  } catch { return localGet('certificates') }
}

export async function saveCert(cert: Record<string, any>) {
  localSet('certificates', [...localGet('certificates').filter((c: any) => c.id !== cert.id), cert])
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    await supabase.from('certificates').upsert(cert, { onConflict: 'id' })
  } catch {}
}

export async function deleteCert(id: string) {
  localSet('certificates', localGet('certificates').filter((c: any) => c.id !== id))
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    await supabase.from('certificates').delete().eq('id', id)
  } catch {}
}

// ---- Employees ----
export async function getEmployees() {
  if (!SUPABASE_READY) return []
  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase.from('employees').select('*').order('name')
    return data || []
  } catch { return [] }
}

export async function saveEmployees(emps: Record<string, any>[]) {
  // Employees are stored in settings for now
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    const { data: existing } = await supabase.from('employees').select('id')
    const ids = (existing || []).map((e: any) => e.id)
    if (ids.length) await supabase.from('employees').delete().in('id', ids)
    if (emps.length) await supabase.from('employees').upsert(emps)
  } catch {}
}

// ---- Settings ----
export async function getSettings() {
  if (!SUPABASE_READY) return { categories: [], statuses: [], cert_types: [] }
  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase.from('settings').select('*').single()
    return data || {}
  } catch { return {} }
}

export async function saveSettings(settings: Record<string, any>) {
  if (!SUPABASE_READY) return
  try {
    const { supabase } = await import('./supabase/client')
    await supabase.from('settings').upsert(settings, { onConflict: 'user_id' })
  } catch {}
}
