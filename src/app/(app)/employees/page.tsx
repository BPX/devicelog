'use client'
import { useEffect, useState } from 'react'
import { getSettings, saveSettings, importEmployees } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import { Plus, X, Upload, Ghost, Monitor } from 'lucide-react'

function getCounts(): Record<string, number> {
  try {
    const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
    const c: Record<string, number> = {}
    for (const a of assets) { if (a.assigned_to) c[a.assigned_to] = (c[a.assigned_to] || 0) + 1 }
    return c
  } catch { return {} }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<string[]>(getSettings().employees)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [newEmp, setNewEmp] = useState('')
  const [showImport, setShowImport] = useState(false)

  useEffect(() => { setCounts(getCounts()) }, [])

  function persist(list: string[]) {
    setEmployees(list)
    saveSettings({ ...getSettings(), employees: list })
    setCounts(getCounts())
  }

  function add() {
    if (!newEmp.trim()) return
    if (!employees.includes(newEmp.trim())) persist([...employees, newEmp.trim()].sort())
    setNewEmp('')
  }

  function remove(name: string) {
    const count = counts[name] || 0
    if (count > 0 && !confirm(`${name} has ${count} device(s) assigned. Remove from directory anyway? (Assets will keep their name)`)) return
    persist(employees.filter(e => e !== name))
  }

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
      <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={14} /> Import CSV</button>
    </div>

    <div className="max-w-2xl">
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
        <div className="flex gap-2 mb-4">
          <input value={newEmp} onChange={e => setNewEmp(e.target.value)} placeholder="Add employee..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter') add() }} />
          <button onClick={add} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>

        {employees.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No employees yet. Import a CSV, add manually, or type a new name when assigning an asset — it auto-adds here.</p>
        ) : (
          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-auto">
            {employees.map(e => {
              const count = counts[e] || 0
              return (
                <div key={e} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${count === 0 ? 'bg-red-50 border border-red-100' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className={count > 0 ? 'text-slate-400' : 'text-red-300'} />
                    <span className="text-slate-700">{e}</span>
                    {count === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"><Ghost size={10} /> 0 assets</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{count} device{count !== 1 ? 's' : ''}</span>
                    <button onClick={() => remove(e)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>

    {showImport && <CsvImport title="Import Employees" description="Upload a CSV with employee names." sampleData="John Smith\nJane Doe\nBob Wilson" sampleFilename="employees.csv" onImport={rows => { importEmployees(rows.map(r => Object.values(r)[0])); setEmployees(getSettings().employees); setCounts(getCounts()); setShowImport(false) }} onClose={() => setShowImport(false)} />}
  </div>)
}
