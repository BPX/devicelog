// App-wide settings stored in localStorage
const KEY = 'devicelog_settings'

export interface Employee {
  name: string
  email: string
  job_title: string
  department: string
}

export interface AppSettings {
  categories: string[]
  statuses: string[]
  employees: Employee[]
  cert_types: string[]
}

const defaults: AppSettings = {
  categories: ['laptop','desktop','monitor','phone','tablet','server','printer','network','software','license','other'],
  statuses: ['active','maintenance','retired','lost'],
  employees: [],
  cert_types: ['ssl_cert','software_license','support_contract','domain','other'],
}

function migrateEmployees(stored: any): Employee[] {
  const raw = stored.employees || []
  if (raw.length === 0) return []
  // Already objects
  if (typeof raw[0] === 'object') return raw
  // Old string[] format — migrate to objects
  return raw.map((name: string) => ({ name, email: '', job_title: '', department: '' }))
}

export function getSettings(): AppSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...defaults, ...stored, employees: migrateEmployees(stored) }
  } catch { return { ...defaults } }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function addEmployee(name: string) {
  const s = getSettings()
  if (!s.employees.find(e => e.name === name)) {
    s.employees.push({ name, email: '', job_title: '', department: '' })
    saveSettings(s)
  }
}

export function importEmployees(rows: Record<string, string>[]) {
  const s = getSettings()
  const existing = new Set(s.employees.map(e => e.name))
  for (const r of rows) {
    const name = (r.name || r['name'] || r[Object.keys(r)[0]] || '').trim()
    if (name && !existing.has(name)) {
      s.employees.push({ name, email: (r.email || '').trim(), job_title: (r.job_title || '').trim(), department: (r.department || '').trim() })
      existing.add(name)
    }
  }
  s.employees.sort((a,b) => a.name.localeCompare(b.name))
  saveSettings(s)
}
