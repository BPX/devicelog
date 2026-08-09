'use client'
import { useEffect, useState } from 'react'
import { getSettings, saveSettings, importEmployees } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import { Plus, Search, X, Upload, Ghost, Monitor } from 'lucide-react'

function getCounts(): Record<string, number> {
  try {
    const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
    const c: Record<string, number> = {}
    for (const a of assets) { if (a.assigned_to) c[a.assigned_to] = (c[a.assigned_to] || 0) + 1 }
    return c
  } catch { return {} }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<string[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [newEmp, setNewEmp] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{name:string, count:number}|null>(null)

  useEffect(() => { setEmployees(getSettings().employees); setCounts(getCounts()) }, [])

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
    if (count > 0) { setConfirmRemove({ name, count }); return }
    persist(employees.filter(e => e !== name))
  }

  const filtered = employees.filter(e => e.toLowerCase().includes(search.toLowerCase()))

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={16}/>Import CSV</button>
        <button onClick={() => { const inp = document.getElementById('emp-add-input') as HTMLInputElement; inp?.focus() }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Employee</button>
      </div>
    </div>

    <div className="mb-4 flex gap-2">
      <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search employees..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>
      <input id="emp-add-input" value={newEmp} onChange={e => setNewEmp(e.target.value)} placeholder="Name..." className="w-48 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" onKeyDown={e => { if(e.key==='Enter') add() }} />
      <button onClick={add} className="px-3 py-2 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-700"><Plus size={14}/></button>
    </div>

    {filtered.length === 0 ? (
      <div className="text-center py-16 text-slate-400"><Monitor size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No employees yet</p><p className="text-sm mt-1">Import a CSV, add manually, or type a name when assigning an asset — it auto-adds here.</p></div>
    ) : (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-slate-500 bg-slate-50 border-b">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Devices</th>
                <th className="py-3 px-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const count = counts[e] || 0
                return (
                  <tr key={e} className={`border-b border-slate-100 ${count === 0 ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className={count > 0 ? 'text-slate-400' : 'text-red-300'} />
                        <span className="text-slate-900 font-medium">{e}</span>
                        {count === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"><Ghost size={10}/>0</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{count}</td>
                    <td className="py-2.5 px-4"><button onClick={() => remove(e)} className="p-1 hover:bg-red-50 rounded"><X size={14} className="text-slate-300 hover:text-red-500"/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {showImport && <CsvImport title="Import Employees" description="Upload a CSV with employee names." sampleData="John Smith\nJane Doe\nBob Wilson" sampleFilename="employees.csv" onImport={rows => { importEmployees(rows.map(r => Object.values(r)[0])); setEmployees(getSettings().employees); setCounts(getCounts()); setShowImport(false) }} onClose={() => setShowImport(false)} />}

    {confirmRemove && <ConfirmDialog
      title={`Remove ${confirmRemove.name}?`}
      message={`They have ${confirmRemove.count} device(s) assigned. Removing will unassign all their assets.`}
      confirmLabel="Remove"
      onConfirm={() => { 
        persist(employees.filter(e => e !== confirmRemove.name))
        try {
          const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
          let changed = false
          for (const a of assets) { if (a.assigned_to === confirmRemove.name) { a.assigned_to = ''; changed = true } }
          if (changed) localStorage.setItem('trackstack_assets', JSON.stringify(assets))
        } catch {}
        setConfirmRemove(null) 
      }}
      onCancel={() => setConfirmRemove(null)}
    />}
  </div>)
}
