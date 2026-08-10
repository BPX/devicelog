// App-wide settings stored in localStorage
const KEY = 'trackstack_settings'

export interface AppSettings {
  categories: string[]
  statuses: string[]
  employees: string[]
  cert_types: string[]
}

const defaults: AppSettings = {
  categories: ['laptop','desktop','monitor','phone','tablet','server','printer','network','software','license','other'],
  statuses: ['active','maintenance','retired','lost'],
  employees: [],
  cert_types: ['ssl_cert','software_license','support_contract','domain','other'],
}

export function getSettings(): AppSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...defaults, ...stored }
  } catch { return { ...defaults } }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function addEmployee(name: string) {
  const s = getSettings()
  if (!s.employees.includes(name)) { s.employees.push(name); saveSettings(s) }
}

export function importEmployees(names: string[]) {
  const s = getSettings()
  const existing = new Set(s.employees)
  for (const n of names) { if (n.trim()) existing.add(n.trim()) }
  s.employees = [...existing].sort()
  saveSettings(s)
}
