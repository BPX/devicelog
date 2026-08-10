'use client'

// Direct Supabase REST calls — works because JWT is ~500 bytes (avatar was stripped)
import { K as SUPABASE_KEY } from './auth'

const SUPABASE_URL = 'https://mbsjxuymiuevankxrgmo.supabase.co/rest/v1'
const STORAGE_URL = 'https://mbsjxuymiuevankxrgmo.supabase.co/storage/v1'

// ── Types ──────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  name: string
  category: string
  manufacturer: string
  model: string
  serial_number: string
  status: string
  assigned_to: string
  location: string
  purchase_date: string | null
  warranty_expires: string | null
  image?: string
  user_id?: string
  team_id?: string
  created_at?: string
  updated_at?: string
}

export interface AssetQuery {
  teamId: string
  page?: number         // 1-based, default 1
  limit?: number        // rows per page, default 50
  search?: string
  sortField?: string
  sortDir?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface DataError {
  error: string
  details?: string
}

// ── Internal helpers ───────────────────────────────────────────────────

function token(): string {
  return localStorage.getItem('sb_token') || 'anon'
}

async function req(path: string, method: string, body?: any, extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    ...(extraHeaders || {}),
  }
  const tok = token()
  if (tok !== 'anon') headers['Authorization'] = 'Bearer ' + tok
  if (body) {
    headers['Content-Type'] = 'application/json'
    headers['Prefer'] = 'return=representation'
  }

  try {
    const r = await window.fetch(SUPABASE_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    // Parse the response
    const text = await r.text()

    if (!r.ok) {
      const err: DataError = { error: `HTTP ${r.status}: ${r.statusText}`, details: text }
      return method === 'GET' ? { error: err.error, data: [] } : { error: err.error, data: null }
    }

    const data = text ? JSON.parse(text) : (method === 'GET' ? [] : null)

    // Parse count from Content-Range header (pagination)
    const range = r.headers.get('content-range')
    const total = range ? parseInt(range.split('/')[1], 10) : undefined

    return { data, total, error: null }
  } catch (e: any) {
    return { error: e?.message || 'Network error', data: method === 'GET' ? [] : null }
  }
}

function uid(): string {
  const t = localStorage.getItem('sb_token')
  if (!t) return 'anon'
  try { return JSON.parse(atob(t.split('.')[1])).sub || 'anon' } catch { return 'anon' }
}
const u = () => uid()

// Encode URL params for Supabase REST
function encodeParams(obj: Record<string, string | number | undefined>): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    parts.push(`${k}=${encodeURIComponent(String(v))}`)
  }
  return parts.join('&')
}

// ── Team ───────────────────────────────────────────────────────────────

export async function getTeam() {
  const { data } = await req(
    '/team_members?select=team_id&user_id=eq.' + u() + '&limit=1',
    'GET'
  )
  if (!data?.length) return null
  const { data: teams } = await req('/teams?select=*&id=eq.' + data[0].team_id, 'GET')
  return teams?.[0] || null
}

export async function removeMember(teamId: string, userId: string) {
  const { error } = await req(
    '/team_members?team_id=eq.' + teamId + '&user_id=eq.' + userId,
    'DELETE'
  )
  return { error }
}

export async function createTeam(name: string): Promise<{ error?: string }> {
  const { data: r, error } = await req('/teams', 'POST', { name, owner_id: u() })
  if (error || !r?.[0]) return { error: error || 'Failed to create team' }
  const team = r[0]
  await req('/team_members', 'POST', { team_id: team.id, user_id: u(), role: 'admin' })
  await req('/settings', 'POST', { user_id: u(), team_id: team.id })
  return {}
}

export async function getTeamMembers(teamId: string) {
  const { data } = await req(
    '/team_members?select=user_id,role&team_id=eq.' + teamId,
    'GET'
  )
  return data
}

/** Look up a user by email — checks user_profiles first, falls back to auth.users via RPC. */
export async function lookupUserByEmail(email: string): Promise<{ user_id: string; username: string } | null> {
  const { data } = await req(
    '/rpc/lookup_user',
    'POST',
    { p_email: email.toLowerCase().trim() }
  )
  if (!data || data.error) return null
  return {
    user_id: data.user_id,
    username: data.username || 'User',
  }
}

/** Invite a user to the team by user_id. Only the team owner should call this (enforced by RLS). */
export async function inviteMember(teamId: string, userId: string) {
  const { error } = await req('/team_members', 'POST', { team_id: teamId, user_id: userId, role: 'viewer' })
  return { error }
}

// ── Assets (team-scoped, paginated) ────────────────────────────────────

/** Legacy: fetch all assets by user_id (for dashboard, certificates). */
export async function getAssets(): Promise<Asset[]> {
  const { data } = await req(
    '/assets?select=*&user_id=eq.' + u() + '&order=created_at.desc',
    'GET'
  )
  return data
}

/** Full-featured team-scoped asset query with pagination, search, and sort. */
export async function queryAssets(params: AssetQuery): Promise<PaginatedResult<Asset>> {
  const { teamId, page = 1, limit = 50, search, sortField, sortDir = 'asc' } = params

  // Build query segments
  const q: Record<string, string> = {
    select: '*',
    team_id: `eq.${teamId}`,
  }

  // Search: match against name, assigned_to, serial_number
  if (search && search.trim()) {
    const s = encodeURIComponent(search.trim())
    q['or'] = `(name.ilike.*${s}*,assigned_to.ilike.*${s}*,serial_number.ilike.*${s}*)`
  }

  // Sort
  if (sortField) {
    const dir = sortDir === 'desc' ? 'desc' : 'asc'
    q['order'] = `${sortField}.${dir}.nullslast`
  } else {
    q['order'] = 'created_at.desc.nullslast'
  }

  // Pagination
  const offset = (page - 1) * limit
  q['limit'] = String(limit)
  q['offset'] = String(offset)

  const path = '/assets?' + encodeParams(q)

  const result = await req(
    path,
    'GET',
    undefined,
    {
      // Request count via Prefer header
      'Prefer': 'count=exact',
    }
  )

  return {
    data: result.data || [],
    total: result.total || 0,
    page,
    limit,
  }
}

export async function saveAsset(asset: any, teamId?: string) {
  const body: any = { ...asset, user_id: u() }
  if (teamId) body.team_id = teamId
  const { data, error } = await req('/assets', 'POST', body)
  return { data: data?.[0] || null, error }
}

export async function deleteAsset(id: string) {
  const { error } = await req('/assets?id=eq.' + id, 'DELETE')
  return { error }
}

/** Save multiple assets with a single batch fetch. */
export async function saveAssetsBatch(assets: any[], teamId: string) {
  const results = await Promise.allSettled(
    assets.map(a => saveAsset(a, teamId))
  )
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return { succeeded, failed, total: assets.length }
}

// ── Certificates ───────────────────────────────────────────────────────

export async function getCerts(): Promise<any[]> {
  const { data } = await req(
    '/certificates?select=*&user_id=eq.' + u() + '&order=created_at.desc',
    'GET'
  )
  return data
}

export async function queryCerts(params: {
  teamId: string
  page?: number
  limit?: number
  search?: string
}): Promise<PaginatedResult<any>> {
  const { teamId, page = 1, limit = 50, search } = params
  const q: Record<string, string> = {
    select: '*',
    team_id: `eq.${teamId}`,
    order: 'created_at.desc.nullslast',
    limit: String(limit),
    offset: String((page - 1) * limit),
  }
  if (search?.trim()) {
    q['or'] = `(name.ilike.*${encodeURIComponent(search.trim())}*,issuer.ilike.*${encodeURIComponent(search.trim())}*)`
  }
  const path = '/certificates?' + encodeParams(q)
  const result = await req(path, 'GET', undefined, { 'Prefer': 'count=exact' })
  return {
    data: result.data || [],
    total: result.total || 0,
    page,
    limit,
  }
}

export async function saveCert(c: any, teamId?: string) {
  const body: any = { ...c, user_id: u() }
  if (teamId) body.team_id = teamId
  const { data, error } = await req('/certificates', 'POST', body)
  return { data: data?.[0] || null, error }
}

export async function deleteCert(id: string) {
  const { error } = await req('/certificates?id=eq.' + id, 'DELETE')
  return { error }
}

// ── Employees ──────────────────────────────────────────────────────────

export async function getEmployees(): Promise<any[]> {
  const { data } = await req(
    '/employees?select=*&user_id=eq.' + u() + '&order=name',
    'GET'
  )
  return data
}

export async function queryEmployees(params: {
  teamId: string
  page?: number
  limit?: number
  search?: string
}): Promise<PaginatedResult<any>> {
  const { teamId, page = 1, limit = 50, search } = params
  const q: Record<string, string> = {
    select: '*',
    team_id: `eq.${teamId}`,
    order: 'name.asc.nullslast',
    limit: String(limit),
    offset: String((page - 1) * limit),
  }
  if (search?.trim()) {
    q['or'] = `(name.ilike.*${encodeURIComponent(search.trim())}*,email.ilike.*${encodeURIComponent(search.trim())}*,department.ilike.*${encodeURIComponent(search.trim())}*)`
  }
  const path = '/employees?' + encodeParams(q)
  const result = await req(path, 'GET', undefined, { 'Prefer': 'count=exact' })
  return {
    data: result.data || [],
    total: result.total || 0,
    page,
    limit,
  }
}

export async function saveEmployee(e: any, teamId?: string) {
  const body: any = { ...e, user_id: u() }
  if (teamId) body.team_id = teamId
  const { data, error } = await req('/employees', 'POST', body)
  return { data: data?.[0] || null, error }
}

export async function deleteEmployee(id: string) {
  const { error } = await req('/employees?id=eq.' + id, 'DELETE')
  return { error }
}

// ── Settings ───────────────────────────────────────────────────────────

export async function getSettings() {
  const { data: r } = await req(
    '/settings?select=*&user_id=eq.' + u() + '&limit=1',
    'GET'
  )
  return r?.[0] || {}
}

export async function getTeamSettings(teamId: string) {
  const { data: r } = await req(
    '/settings?select=*&team_id=eq.' + teamId + '&limit=1',
    'GET'
  )
  return r?.[0] || {}
}

export async function saveSettings(s: any) {
  const { data, error } = await req('/settings', 'POST', { ...s, user_id: u() })
  return { data: data?.[0] || null, error }
}

// ── Image upload (Supabase Storage) ────────────────────────────────────

/**
 * Upload an image to Supabase Storage and return the public URL.
 * Bucket: 'asset-images' (must exist with public access).
 * Max size: 500KB (enforced client-side before calling).
 */
export async function uploadAssetImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${uid()}_${Date.now()}.${ext}`
  const tok = token()

  try {
    const r = await window.fetch(
      `${STORAGE_URL}/object/asset-images/${filename}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + tok,
          'Content-Type': file.type,
        },
        body: file,
      }
    )
    if (!r.ok) return null

    // Return public URL
    return `${STORAGE_URL}/object/public/asset-images/${filename}`
  } catch {
    return null
  }
}

/**
 * Delete an image from Supabase Storage given its full URL.
 */
export async function deleteAssetImage(url: string): Promise<boolean> {
  const tok = token()
  // Extract path from URL: .../object/public/asset-images/filename.ext
  const match = url.match(/\/asset-images\/(.+)$/)
  if (!match) return false

  try {
    const r = await window.fetch(
      `${STORAGE_URL}/object/asset-images/${match[1]}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + tok,
        },
      }
    )
    return r.ok
  } catch {
    return false
  }
}
