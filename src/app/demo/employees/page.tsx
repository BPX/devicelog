'use client'
import { useState } from 'react'
import { Search, Monitor, ArrowUpDown, ArrowUp, ArrowDown, Ghost } from 'lucide-react'

interface Employee {
  name: string; email: string; job_title: string; department: string; devices: number
}

const sampleEmployees: Employee[] = [
  { name: 'Sarah Chen', email: 'sarah@company.com', job_title: 'VP Engineering', department: 'Engineering', devices: 3 },
  { name: 'Marcus Rivera', email: 'marcus@company.com', job_title: 'Senior Developer', department: 'Engineering', devices: 2 },
  { name: 'Priya Patel', email: 'priya@company.com', job_title: 'Product Manager', department: 'Product', devices: 2 },
  { name: 'James Wilson', email: 'james@company.com', job_title: 'Design Lead', department: 'Design', devices: 2 },
  { name: 'Emma Thompson', email: 'emma@company.com', job_title: 'Marketing Director', department: 'Marketing', devices: 1 },
  { name: 'David Kim', email: 'david@company.com', job_title: 'Backend Engineer', department: 'Engineering', devices: 1 },
  { name: 'Anna Müller', email: 'anna@company.com', job_title: 'Sales Lead', department: 'Sales', devices: 1 },
  { name: 'Tom Baker', email: 'tom@company.com', job_title: 'IT Support', department: 'IT', devices: 0 },
  { name: 'Lisa Wong', email: 'lisa@company.com', job_title: 'Finance Manager', department: 'Finance', devices: 0 },
  { name: 'Carlos Diaz', email: 'carlos@company.com', job_title: 'Operations', department: 'Operations', devices: 0 },
  { name: 'IT Admin', email: 'admin@company.com', job_title: 'System Administrator', department: 'IT', devices: 3 },
  { name: 'Office - Floor 2', email: '', job_title: 'Shared Resource', department: 'Office', devices: 1 },
]

export default function DemoEmployees() {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(f: string) {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('asc') }
  }

  function sortIcon(f: string) {
    if (sortField !== f) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const filtered = sampleEmployees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = sortField
    ? [...filtered].sort((a: any, b: any) => {
        const av = sortField === 'devices' ? a.devices : (a[sortField] || a.name).toString().toLowerCase()
        const bv = sortField === 'devices' ? b.devices : (b[sortField] || b.name).toString().toLowerCase()
        if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc' ? av.localeCompare(bv) : (bv as string).localeCompare(av)
      })
    : filtered

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Employees</h1>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Monitor size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No employees match your search</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-slate-500 bg-slate-50 border-b">
                  <th onClick={() => toggleSort('name')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                    <span className="inline-flex items-center gap-1">Name{sortIcon('name')}</span>
                  </th>
                  <th className="py-3 px-4 font-medium">Email / Role</th>
                  <th onClick={() => toggleSort('department')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                    <span className="inline-flex items-center gap-1">Department{sortIcon('department')}</span>
                  </th>
                  <th onClick={() => toggleSort('devices')} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                    <span className="inline-flex items-center gap-1">Devices{sortIcon('devices')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(e => (
                  <tr key={e.name} className={`border-b border-slate-100 ${e.devices === 0 ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className={e.devices > 0 ? 'text-slate-400' : 'text-red-300'} />
                        <span className="text-slate-900 font-medium">{e.name}</span>
                        {e.devices === 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                            <Ghost size={10} />0
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {e.email ? <div className="text-xs text-slate-500">{e.email}</div> : null}
                      {e.job_title ? <div className="text-xs text-slate-400">{e.job_title}</div> : null}
                      {!e.email && !e.job_title && <span className="text-xs text-slate-400 italic">No details</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{e.department || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{e.devices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span>{sampleEmployees.length} employees</span>
          </div>
        </div>
      )}
    </div>
  )
}
