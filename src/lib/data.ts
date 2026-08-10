// Supabase data layer — replaces localStorage for all CRUD
import { supabase } from './supabase/client'

// ---- ASSETS ----
export async function getAssets() {
  const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function saveAsset(asset: Record<string, any>) {
  await supabase.from('assets').upsert(asset, { onConflict: 'id' })
}

export async function deleteAsset(id: string) {
  await supabase.from('assets').delete().eq('id', id)
}

export async function saveAssets(assets: Record<string, any>[]) {
  if (assets.length === 0) return
  await supabase.from('assets').upsert(assets, { onConflict: 'id' })
}

// ---- CERTIFICATES ----
export async function getCerts() {
  const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function saveCert(cert: Record<string, any>) {
  await supabase.from('certificates').upsert(cert, { onConflict: 'id' })
}

export async function deleteCert(id: string) {
  await supabase.from('certificates').delete().eq('id', id)
}

// ---- EMPLOYEES ----
export async function getEmployees() {
  const { data } = await supabase.from('employees').select('*').order('name')
  return data || []
}

export async function saveEmployee(emp: Record<string, any>) {
  await supabase.from('employees').upsert(emp, { onConflict: 'id' })
}

export async function deleteEmployee(id: string) {
  await supabase.from('employees').delete().eq('id', id)
}

export async function saveEmployees(employees: Record<string, any>[]) {
  // Clear and re-insert
  const { data: existing } = await supabase.from('employees').select('id')
  const existingIds = (existing || []).map((e: any) => e.id)
  if (existingIds.length > 0) await supabase.from('employees').delete().in('id', existingIds)
  if (employees.length > 0) await supabase.from('employees').upsert(employees)
}

// ---- SETTINGS ----
export async function getSettings() {
  const { data } = await supabase.from('settings').select('*').single()
  return data || { categories: ['laptop','desktop','monitor','phone','tablet','server','printer','network','software','license','other'], statuses: ['active','maintenance','retired','lost'], cert_types: ['ssl_cert','software_license','support_contract','domain','other'] }
}

export async function saveSettings(settings: Record<string, any>) {
  await supabase.from('settings').upsert(settings, { onConflict: 'user_id' })
}
