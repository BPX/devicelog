'use client'
import { useEffect, useState } from 'react'
import { getSettings, saveSettings, importEmployees, type Employee } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import { Plus, Search, X, Upload, Ghost, Monitor, Download, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Mail, Briefcase, Building } from 'lucide-react'
import { downloadCsv } from '@/lib/export'

function getCounts(): Record<string, number> {
  try {
    const assets = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
    const c: Record<string, number> = {}
    for (const a of assets) { if (a.assigned_to) c[a.assigned_to] = (c[a.assigned_to] || 0) + 1 }
    return c
  } catch { return {} }
}

function getCertCounts(): Record<string, number> {
  try {
    const certs = JSON.parse(localStorage.getItem('trackstack_certificates') || '[]')
    const c: Record<string, number> = {}
    for (const cert of certs) { if (cert.assigned_to) c[cert.assigned_to] = (c[cert.assigned_to] || 0) + 1 }
    return c
  } catch { return {} }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [newEmp, setNewEmp] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{name:string, count:number}|null>(null)
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [editEmp, setEditEmp] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({ email:'', job_title:'', department:'' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name:'', email:'', job_title:'', department:'' })

  useEffect(() => { setEmployees(getSettings().employees); setCounts(getCounts())
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowAddModal(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function toggleSort(f: string) {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('asc') }
  }
  function sortIcon(f: string) {
    if (sortField !== f) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  function persist(list: Employee[]) {
    setEmployees(list)
    saveSettings({ ...getSettings(), employees: list })
    setCounts(getCounts())
  }

  function add() {
    if (!newEmp.trim()) return
    if (!employees.find(e => e.name === newEmp.trim())) persist([...employees, { name: newEmp.trim(), email: '', job_title: '', department: '' }].sort((a,b) => a.name.localeCompare(b.name)))
    setNewEmp('')
  }

  function remove(name: string) {
    const count = counts[name] || 0
    if (count > 0) { setConfirmRemove({ name, count }); return }
    persist(employees.filter(e => e.name !== name))
  }

  function saveEdit() {
    if (!editEmp) return
    const updated = employees.map(e => e.name === editEmp.name ? { ...e, ...editForm } : e)
    persist(updated); setEditEmp(null)
  }

  function saveNew() {
    if (!addForm.name.trim()) return
    if (employees.find(e => e.name === addForm.name.trim())) return
    persist([...employees, { name: addForm.name.trim(), email: addForm.email.trim(), job_title: addForm.job_title.trim(), department: addForm.department.trim() }].sort((a,b) => a.name.localeCompare(b.name)))
    setShowAddModal(false)
    setAddForm({ name:'', email:'', job_title:'', department:'' })
  }

  function startEdit(emp: Employee) {
    setEditEmp(emp)
    setEditForm({ email: emp.email || '', job_title: emp.job_title || '', department: emp.department || '' })
  }

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()) || e.department?.toLowerCase().includes(search.toLowerCase()))

  const sorted = sortField ? [...filtered].sort((a,b) => {
    const av = sortField === 'devices' ? (counts[a.name]||0) : (a[sortField as keyof Employee] || a.name).toString().toLowerCase()
    const bv = sortField === 'devices' ? (counts[b.name]||0) : (b[sortField as keyof Employee] || b.name).toString().toLowerCase()
    if (typeof av === 'number') return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av
    return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
  }) : filtered

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={16}/>Import CSV</button>
        <button onClick={() => downloadCsv(employees.map(e => ({ name: e.name, email: e.email, job_title: e.job_title, department: e.department, devices: counts[e.name]||0 })), 'trackstack-employees.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Download size={16}/>Export</button>
        <button onClick={() => { setAddForm({ name:'', email:'', job_title:'', department:'' }); setShowAddModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Employee</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search employees..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

    {filtered.length === 0 ? (
      <div className="text-center py-16 text-slate-400"><Monitor size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No employees yet</p><p className="text-sm mt-1">Import a CSV, add manually, or type a name when assigning an asset — it auto-adds here.</p></div>
    ) : (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-slate-500 bg-slate-50 border-b">
                <th onClick={() => toggleSort('name')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700"><span className="inline-flex items-center gap-1">Name{sortIcon('name')}</span></th>
                <th className="py-3 px-4 font-medium">Email / Role</th>
                <th onClick={() => toggleSort('department')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700"><span className="inline-flex items-center gap-1">Department{sortIcon('department')}</span></th>
                <th onClick={() => toggleSort('devices')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700"><span className="inline-flex items-center gap-1">Devices{sortIcon('devices')}</span></th>
                <th className="py-3 px-4 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const count = counts[e.name] || 0
                return (
                  <tr key={e.name} className={`border-b border-slate-100 ${count === 0 ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className={count > 0 ? 'text-slate-400' : 'text-red-300'} />
                        <span className="text-slate-900 font-medium">{e.name}</span>
                        {count === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"><Ghost size={10}/>0</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {e.email ? <div className="text-xs text-slate-500">{e.email}</div> : null}
                      {e.job_title ? <div className="text-xs text-slate-400">{e.job_title}</div> : null}
                      {!e.email && !e.job_title && <span className="text-xs text-slate-400 italic">No details</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{e.department || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{count}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(e)} className="p-1 hover:bg-slate-100 rounded"><Pencil size={14} className="text-slate-400"/></button>
                        <button onClick={() => remove(e.name)} className="p-1 hover:bg-red-50 rounded"><X size={14} className="text-slate-300 hover:text-red-500"/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {showAddModal && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-lg border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">New Employee</h2>
      <div className="space-y-3"><div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label><input autoFocus value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="John Smith" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter') saveNew() }} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label><input value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="john@company.com" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Job Title</label><input value={addForm.job_title} onChange={e => setAddForm({...addForm, job_title: e.target.value})} placeholder="IT Manager" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label><input value={addForm.department} onChange={e => setAddForm({...addForm, department: e.target.value})} placeholder="Engineering" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
      </div>
      <div className="flex gap-2 pt-2"><button onClick={saveNew} disabled={!addForm.name.trim()} className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">Add Employee</button><button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div></div></div></div>}

    {editEmp && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-lg border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">Edit {editEmp.name}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label><input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="person@company.com" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Job Title</label><input value={editForm.job_title} onChange={e => setEditForm({...editForm, job_title: e.target.value})} placeholder="IT Manager" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label><input value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} placeholder="Engineering" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" /></div>
        <div className="flex items-end"><span className="text-xs text-slate-400">Name cannot be changed</span></div>
      </div>
      <div className="flex gap-2 pt-2"><button onClick={saveEdit} className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">Save Changes</button><button onClick={() => setEditEmp(null)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div></div></div>}

    {showImport && <CsvImport title="Import Employees" description="Upload a CSV with name, email, job title, department." sampleData={`name,email,job_title,department
John Smith,john@company.com,IT Manager,IT
Jane Doe,jane@company.com,System Admin,IT`} sampleFilename="employees.csv" onImport={rows => { importEmployees(rows); setEmployees(getSettings().employees); setCounts(getCounts()); setShowImport(false) }} onClose={() => setShowImport(false)} />}

    {confirmRemove && <ConfirmDialog
      title={`Remove ${confirmRemove.name}?`}
      message={`They have ${confirmRemove.count} device(s) assigned. Removing will unassign all their assets.`}
      confirmLabel="Remove"
      onConfirm={() => {
        persist(employees.filter(e => e.name !== confirmRemove.name))
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
