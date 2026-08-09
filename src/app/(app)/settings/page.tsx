'use client'
import { useEffect, useState } from 'react'
import { getSettings, saveSettings, importEmployees, type AppSettings } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import { Plus, X, Upload, Monitor, Ghost } from 'lucide-react'

function getAssetCounts(): Record<string, number> {
  try {
    const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
    const counts: Record<string, number> = {}
    for (const a of assets) {
      if (a.assigned_to) counts[a.assigned_to] = (counts[a.assigned_to] || 0) + 1
    }
    return counts
  } catch { return {} }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings())
  const [saved, setSaved] = useState(false)
  const [showEmployeeImport, setShowEmployeeImport] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newEmp, setNewEmp] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => { setCounts(getAssetCounts()) }, [])

  function persist(updated: AppSettings) { setSettings(updated); saveSettings(updated) }

  function addItem(field: 'categories'|'statuses'|'employees', value: string) {
    if (!value.trim()) return
    if (!settings[field].includes(value.trim())) {
      persist({ ...settings, [field]: [...settings[field], value.trim()].sort() })
    }
  }

  function removeItem(field: 'categories'|'statuses'|'employees', value: string) {
    if (field === 'employees') {
      const count = counts[value] || 0
      if (count > 0 && !confirm(`${value} has ${count} device(s) assigned. Remove and unassign all?`)) return
      // Clear from assets
      try {
        const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
        let changed = false
        for (const a of assets) { if (a.assigned_to === value) { a.assigned_to = ''; changed = true } }
        if (changed) localStorage.setItem('trackstack_assets', JSON.stringify(assets))
      } catch {}
    }
    persist({ ...settings, [field]: settings[field].filter(v => v !== value) })
    if (field === 'employees') setCounts(getAssetCounts())
  }

  function save() { saveSettings(settings); setCounts(getAssetCounts()); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (<div>
    <h1 className="text-2xl font-semibold text-slate-900 mb-6">Settings</h1>
    <div className="max-w-2xl space-y-8">

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-medium text-slate-900 mb-1">Asset Categories</h2>
        <p className="text-sm text-slate-500 mb-4">Customize the categories you track</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.categories.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
              {c} <button onClick={() => removeItem('categories', c)} className="hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('categories',newCat);setNewCat('')} }} />
          <button onClick={() => { addItem('categories', newCat); setNewCat('') }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-medium text-slate-900 mb-1">Asset Statuses</h2>
        <p className="text-sm text-slate-500 mb-4">Custom statuses like "In Repair", "Decommissioned", "Ready to Deploy"</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.statuses.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
              {s} <button onClick={() => removeItem('statuses', s)} className="hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="New status..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('statuses',newStatus);setNewStatus('')} }} />
          <button onClick={() => { addItem('statuses', newStatus); setNewStatus('') }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-medium text-slate-900">Employee Directory</h2>
          <button onClick={() => setShowEmployeeImport(true)} className="flex items-center gap-1 text-xs text-cyan-600 hover:underline"><Upload size={12} /> Import CSV</button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Quick-assign assets to people. Names typed in asset forms are added automatically.</p>
        {settings.employees.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No employees yet. Import a CSV or add below — names also auto-add when assigned to assets.</p>
        ) : (
          <div className="space-y-1 mb-4 max-h-80 overflow-auto">
            {settings.employees.map(e => {
              const count = counts[e] || 0
              return (
                <div key={e} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${count === 0 ? 'bg-red-50 border border-red-100' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700">{e}</span>
                    {count === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"><Ghost size={10} /> 0 assets</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{count} device{count !== 1 ? 's' : ''}</span>
                    <button onClick={() => removeItem('employees', e)} className="hover:text-red-500"><X size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex gap-2">
          <input value={newEmp} onChange={e => setNewEmp(e.target.value)} placeholder="Employee name..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('employees',newEmp);setNewEmp('')} }} />
          <button onClick={() => { addItem('employees', newEmp); setNewEmp(''); setCounts(getAssetCounts()) }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      {showEmployeeImport && <CsvImport title="Import Employees" description="Upload a CSV with employee names. First column is used as the employee name." sampleData="John Smith\nJane Doe\nBob Wilson" sampleFilename="employees.csv" onImport={rows => { importEmployees(rows.map(r => Object.values(r)[0])); setSettings(getSettings()); setCounts(getAssetCounts()); setShowEmployeeImport(false) }} onClose={() => setShowEmployeeImport(false)} />}

      <button onClick={save} className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">{saved ? 'Saved!' : 'Save Settings'}</button>
    </div>
  </div>)
}
