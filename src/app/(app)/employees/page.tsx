'use client'
import { useEffect, useState } from 'react'
import { getTeam, getEmployees, queryAssets, saveEmployee, deleteEmployee, saveAsset, deleteAsset } from '@/lib/data'
import { addToast } from '@/components/toast'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import { Plus, Search, X, Upload, Ghost, Monitor, Download, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Copy } from 'lucide-react'
import { downloadCsv } from '@/lib/export'
import Link from 'next/link'

interface Employee {
  id?: string
  user_id?: string
  name: string
  email: string
  job_title: string
  department: string
}

export default function EmployeesPage() {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamLoading, setTeamLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [newEmp, setNewEmp] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{name:string, count:number}|null>(null)

  // ── Multi-select ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function selectAll() {
    if (selectedIds.size === employees.length) { setSelectedIds(new Set()); return }
    setSelectedIds(new Set(employees.map(e => e.id!).filter(Boolean)))
  }

  async function doBulkDelete() {
    setBulkDeleting(false)
    for (const id of selectedIds) await deleteEmployee(id)
    setSelectedIds(new Set())
    await loadEmployees()
    await loadCounts()
  }
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [editEmp, setEditEmp] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({ email:'', job_title:'', department:'' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [addError, setAddError] = useState('')
  const [addForm, setAddForm] = useState({ first_name:'', last_name:'', email:'', job_title:'', department:'' })

  // ── Load team ──
  useEffect(() => {
    (async () => {
      const team = await getTeam()
      setTeamId(team?.id || null)
      setTeamLoading(false)
    })()
  }, [])

  // ── Compute asset counts from Supabase ──
  async function loadCounts() {
    if (!teamId) { setCounts({}); return }
    const result = await queryAssets({ teamId, limit: 10000 })
    const c: Record<string, number> = {}
    for (const a of result.data) {
      if (a.assigned_to) c[a.assigned_to] = (c[a.assigned_to] || 0) + 1
    }
    setCounts(c)
  }

  async function loadEmployees() {
    const data = await getEmployees()
    setEmployees(data || [])
    await loadCounts()
  }

  useEffect(() => {
    if (!teamLoading) loadEmployees()
  }, [teamLoading])

  useEffect(() => {
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

  async function add() {
    if (!newEmp.trim() || !teamId) return
    if (!employees.find(e => e.name === newEmp.trim())) {
      await saveEmployee({ name: newEmp.trim(), email: '', job_title: '', department: '' }, teamId)
      await loadEmployees()
    }
    setNewEmp('')
  }

  async function removeEmp(name: string) {
    const count = counts[name] || 0
    if (count > 0) { setConfirmRemove({ name, count }); return }
    const emp = employees.find(e => e.name === name)
    if (emp?.id) await deleteEmployee(emp.id)
    await loadEmployees()
  }

  async function saveEdit() {
    if (!editEmp || !teamId) return
    const oldName = employees.find(e => e.id === editEmp.id || e.name === editEmp.name)?.name || ''
    if (editEmp.id) await deleteEmployee(editEmp.id)
    await saveEmployee({
      name: editEmp.name,
      email: editForm.email.trim(),
      job_title: editForm.job_title.trim(),
      department: editForm.department.trim(),
    }, teamId)

    // Rename all assets assigned to the old name
    if (editEmp.name !== oldName) {
      const result = await queryAssets({ teamId, limit: 10000 })
      for (const a of result.data) {
        if (a.assigned_to === oldName) {
          await deleteAsset(a.id)
          await saveAsset({ ...a, assigned_to: editEmp.name }, teamId)
        }
      }
    }
    setEditEmp(null)
    await loadEmployees()
  }

  async function saveNew() {
    if (!addForm.first_name.trim() || !teamId) return
    const fullName = `${addForm.first_name.trim()} ${addForm.last_name.trim()}`.trim()
    if (employees.find(e => e.name.toLowerCase() === fullName.toLowerCase())) { setAddError('An employee with this name already exists.'); return }
    const empId = Date.now().toString() + Math.random().toString(36).slice(2, 6)
    await saveEmployee({
      id: empId,
      name: fullName,
      email: addForm.email.trim(),
      job_title: addForm.job_title.trim(),
      department: addForm.department.trim(),
    }, teamId)
    setShowAddModal(false)
    setAddForm({ first_name:'', last_name:'', email:'', job_title:'', department:'' })
    setAddError('')
    await loadEmployees()
  }

  function startEdit(emp: Employee) {
    setEditEmp(emp)
    setEditForm({ email: emp.email || '', job_title: emp.job_title || '', department: emp.department || '' })
  }

  function copyInfo(emp: Employee) {
    const parts = [emp.name]
    if (emp.email) parts.push(emp.email)
    if (emp.job_title) parts.push(emp.job_title)
    if (emp.department) parts.push(emp.department)
    const text = parts.join('\n')
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    })
  }

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()) || e.department?.toLowerCase().includes(search.toLowerCase()))

  const sorted = sortField ? [...filtered].sort((a,b) => {
    const av = sortField === 'devices' ? (counts[a.name]||0) : (a[sortField as keyof Employee] || a.name).toString().toLowerCase()
    const bv = sortField === 'devices' ? (counts[b.name]||0) : (b[sortField as keyof Employee] || b.name).toString().toLowerCase()
    if (typeof av === 'number') return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av
    return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
  }) : filtered

  if (teamLoading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading...</div>

  if (!teamId) return (
    <div className="text-center py-20">
      <Monitor size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No team set up</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create or join a team to manage employees.</p>
      <Link href="/team" className="inline-block mt-4 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">Go to Team</Link>
    </div>
  )

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Employees</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Upload size={16}/>Import CSV</button>
        <button onClick={() => downloadCsv(employees.map(e => ({ name: e.name, email: e.email, job_title: e.job_title, department: e.department, devices: counts[e.name]||0 })), 'devicelog-employees.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={16}/>Export</button>
        <button onClick={() => { setAddForm({ first_name:'', last_name:'', email:'', job_title:'', department:'' }); setAddError(''); setShowAddModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400"><Plus size={16}/>Add Employee</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"/><input placeholder="Search employees..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

    {filtered.length === 0 ? (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500"><Monitor size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No employees yet</p><p className="text-sm mt-1">Import a CSV, add manually, or type a name when assigning an asset — it auto-adds here.</p></div>
    ) : (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-cyan-50 dark:bg-cyan-950 border-b border-cyan-200 dark:border-cyan-800 text-sm">
            <span className="text-cyan-800 dark:text-cyan-200 font-medium">{selectedIds.size} selected</span>
            <button onClick={() => setBulkDeleting(true)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">Delete</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-400">Clear</button>
          </div>
        )}
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" checked={selectedIds.size === employees.length && employees.length > 0} onChange={selectAll} className="rounded border-slate-300" />
                </th>
                <th onClick={() => toggleSort('name')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1">Name{sortIcon('name')}</span></th>
                <th className="py-3 px-4 font-medium">Email / Role</th>
                <th onClick={() => toggleSort('department')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1">Department{sortIcon('department')}</span></th>
                <th onClick={() => toggleSort('devices')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1">Devices{sortIcon('devices')}</span></th>
                <th className="py-3 px-4 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const count = counts[e.name] || 0
                return (
                  <tr key={e.id || e.name} className={`border-b border-slate-100 dark:border-slate-800 ${count === 0 ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <td className="py-2.5 px-4">
                      <input type="checkbox" checked={selectedIds.has(e.id || e.name)} onChange={() => toggleSelect(e.id || e.name)} className="rounded border-slate-300" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className={count > 0 ? 'text-slate-400 dark:text-slate-500' : 'text-red-300'} />
                        <span className="text-slate-900 dark:text-slate-100 font-medium">{e.name}</span>
                        {count === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded text-xs font-medium"><Ghost size={10}/>0</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {e.email ? <div className="text-xs text-slate-500 dark:text-slate-400">{e.email}</div> : null}
                      {e.job_title ? <div className="text-xs text-slate-400 dark:text-slate-500">{e.job_title}</div> : null}
                      {!e.email && !e.job_title && <span className="text-xs text-slate-400 dark:text-slate-500 italic">No details</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{e.department || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{count}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => copyInfo(e)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Copy size={14} className="text-slate-400 dark:text-slate-500"/></button>
                        <button onClick={() => startEdit(e)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={14} className="text-slate-400 dark:text-slate-500"/></button>
                        <button onClick={() => removeEmp(e.name)} className="p-1 hover:bg-red-50 dark:bg-red-950 rounded"><X size={14} className="text-slate-300 dark:text-slate-600 hover:text-red-500"/></button>
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

    {showAddModal && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-xl"><h2 className="text-lg font-semibold mb-4">New Employee</h2>
      <div className="space-y-3"><div className="grid grid-cols-2 gap-3">
        {addError && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded mb-3">{addError}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">First Name *</label><input autoFocus value={addForm.first_name} onChange={e => setAddForm({...addForm, first_name: e.target.value})} placeholder="John" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" onKeyDown={e => { if(e.key==='Enter') saveNew() }} /></div>
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Last Name</label><input value={addForm.last_name} onChange={e => setAddForm({...addForm, last_name: e.target.value})} placeholder="Smith" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" onKeyDown={e => { if(e.key==='Enter') saveNew() }} /></div>
        </div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label><input value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="john@company.com" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Job Title</label><input value={addForm.job_title} onChange={e => setAddForm({...addForm, job_title: e.target.value})} placeholder="IT Manager" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label><input value={addForm.department} onChange={e => setAddForm({...addForm, department: e.target.value})} placeholder="Engineering" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
      </div>
      <div className="flex gap-2 pt-2"><button onClick={saveNew} disabled={!addForm.first_name.trim()} className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50">Add Employee</button><button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button></div></div></div></div>}

    {editEmp && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-xl"><h2 className="text-lg font-semibold mb-4">Edit {editEmp.name}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label><input value={editEmp?.name || ''} onChange={e => { if (editEmp) setEditEmp({...editEmp, name: e.target.value}) }} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label><input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="person@company.com" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Job Title</label><input value={editForm.job_title} onChange={e => setEditForm({...editForm, job_title: e.target.value})} placeholder="IT Manager" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label><input value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} placeholder="Engineering" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
      </div>
      <div className="flex gap-2 pt-2"><button onClick={saveEdit} className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">Save Changes</button><button onClick={() => setEditEmp(null)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button></div></div></div>}

    {showImport && <CsvImport title="Import Employees" description="Upload a CSV with name, email, job title, department." sampleData={`name,email,job_title,department
John Smith,john@company.com,IT Manager,IT
Jane Doe,jane@company.com,System Admin,IT`} sampleFilename="employees.csv" onImport={async rows => {
      if (!teamId) return
      const existingEmails = new Set(employees.filter(e => e.email).map(e => e.email.toLowerCase()))
      let imported = 0, skipped = 0
      for (const r of rows) {
        const name = (r.name || r['name'] || r[Object.keys(r)[0]] || '').trim()
        const email = (r.email || '').trim()
        if (!name) continue
        if (email && existingEmails.has(email.toLowerCase())) { skipped++; continue }
        if (email) existingEmails.add(email.toLowerCase())
        const empId = Date.now().toString() + Math.random().toString(36).slice(2, 6)
        await saveEmployee({
          id: empId,
          name,
          email,
          job_title: (r.job_title || '').trim(),
          department: (r.department || '').trim(),
        }, teamId)
        imported++
      }
      await loadEmployees()
      setShowImport(false)
      if (skipped > 0) addToast(`Imported ${imported} employees. Skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}.`, 'success')
    }} onClose={() => setShowImport(false)} />}

    {bulkDeleting && (
      <ConfirmDialog
        title={`Delete ${selectedIds.size} employee${selectedIds.size > 1 ? 's' : ''}?`}
        message="This permanently removes the selected employees and unassigns their assets."
        confirmLabel={`Delete ${selectedIds.size}`}
        onConfirm={doBulkDelete}
        onCancel={() => setBulkDeleting(false)}
      />
    )}

    {confirmRemove && <ConfirmDialog
      title={`Remove ${confirmRemove.name}?`}
      message={`They have ${confirmRemove.count} device(s) assigned. Removing will unassign all their assets.`}
      confirmLabel="Remove"
      onConfirm={async () => {
        const emp = employees.find(e => e.name === confirmRemove.name)
        if (emp?.id) await deleteEmployee(emp.id)
        // Unassign all assets for this employee
        if (teamId) {
          const result = await queryAssets({ teamId, limit: 10000 })
          for (const a of result.data) {
            if (a.assigned_to === confirmRemove.name) {
              await deleteAsset(a.id)
              await saveAsset({ ...a, assigned_to: '' }, teamId)
            }
          }
        }
        setConfirmRemove(null)
        await loadEmployees()
      }}
      onCancel={() => setConfirmRemove(null)}
    />}
  </div>)
}
