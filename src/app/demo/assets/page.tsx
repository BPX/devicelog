'use client'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Package, Search, ArrowUpDown, ArrowUp, ArrowDown, Laptop, Monitor, Smartphone, Server, Printer } from 'lucide-react'

interface Asset {
  id: string; name: string; category: string; serial_number: string; status: string
  assigned_to: string; location: string; warranty_expires: string | null
}

const sampleAssets: Asset[] = [
  { id: 'a1', name: 'MacBook Pro 14" M3', category: 'laptop', serial_number: 'MBP-M3-00142', status: 'active', assigned_to: 'Sarah Chen', location: 'Zurich Office', warranty_expires: '2027-03-15' },
  { id: 'a2', name: 'Dell XPS 15 9530', category: 'laptop', serial_number: 'XPS-9530-0089', status: 'active', assigned_to: 'Marcus Rivera', location: 'Geneva Office', warranty_expires: '2026-11-30' },
  { id: 'a3', name: 'ThinkPad X1 Carbon Gen 12', category: 'laptop', serial_number: 'X1C-12-0451', status: 'active', assigned_to: 'Priya Patel', location: 'Zurich Office', warranty_expires: '2028-01-20' },
  { id: 'a4', name: 'Dell UltraSharp U2723QE', category: 'monitor', serial_number: 'U2723QE-7731', status: 'active', assigned_to: 'James Wilson', location: 'Zurich Office', warranty_expires: '2026-06-01' },
  { id: 'a5', name: 'iPhone 16 Pro', category: 'phone', serial_number: 'IP16P-10234', status: 'active', assigned_to: 'Sarah Chen', location: 'Zurich Office', warranty_expires: '2027-09-22' },
  { id: 'a6', name: 'HP LaserJet Pro M404', category: 'printer', serial_number: 'M404-33210', status: 'maintenance', assigned_to: 'Office - Floor 2', location: 'Zurich Office', warranty_expires: '2025-08-15' },
  { id: 'a7', name: 'Synology DS923+ NAS', category: 'server', serial_number: 'DS923-88745', status: 'active', assigned_to: 'IT Admin', location: 'Server Room', warranty_expires: '2027-12-01' },
  { id: 'a8', name: 'iPad Air M2', category: 'tablet', serial_number: 'IPA-M2-5567', status: 'active', assigned_to: 'Emma Thompson', location: 'Geneva Office', warranty_expires: '2027-04-18' },
  { id: 'a9', name: 'Lenovo ThinkVision P27u-20', category: 'monitor', serial_number: 'P27U-22451', status: 'active', assigned_to: 'Priya Patel', location: 'Zurich Office', warranty_expires: '2026-08-10' },
  { id: 'a10', name: 'Samsung Galaxy S25', category: 'phone', serial_number: 'SGS25-99831', status: 'lost', assigned_to: 'Marcus Rivera', location: 'Geneva Office', warranty_expires: '2026-02-28' },
  { id: 'a11', name: 'MacBook Air 15" M3', category: 'laptop', serial_number: 'MBA-M3-00341', status: 'active', assigned_to: 'David Kim', location: 'Zurich Office', warranty_expires: '2027-07-01' },
  { id: 'a12', name: 'Dell OptiPlex 7080', category: 'desktop', serial_number: 'OP7080-4521', status: 'retired', assigned_to: '', location: 'Storage', warranty_expires: null },
  { id: 'a13', name: 'Cisco Meraki MR46 AP', category: 'network', serial_number: 'MR46-99210', status: 'active', assigned_to: 'IT Admin', location: 'Zurich Office', warranty_expires: '2027-05-20' },
  { id: 'a14', name: 'iPhone 15', category: 'phone', serial_number: 'IP15-77321', status: 'active', assigned_to: 'Anna Müller', location: 'Zurich Office', warranty_expires: '2026-09-15' },
  { id: 'a15', name: 'Logitech MX Keys', category: 'other', serial_number: 'MXK-44521', status: 'active', assigned_to: 'James Wilson', location: 'Zurich Office', warranty_expires: null },
]

function categoryIcon(cat: string) {
  switch (cat) {
    case 'laptop': return <Laptop size={16} className="text-slate-300 dark:text-slate-600" />
    case 'desktop': return <Monitor size={16} className="text-slate-300 dark:text-slate-600" />
    case 'server': return <Server size={16} className="text-slate-300 dark:text-slate-600" />
    case 'phone': return <Smartphone size={16} className="text-slate-300 dark:text-slate-600" />
    case 'printer': return <Printer size={16} className="text-slate-300 dark:text-slate-600" />
    default: return <Package size={16} className="text-slate-300 dark:text-slate-600" />
  }
}

export default function DemoAssets() {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function sortIcon(field: string) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const filtered = sampleAssets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.assigned_to?.toLowerCase().includes(search.toLowerCase()) ||
    a.serial_number?.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = sortField
    ? [...filtered].sort((a: any, b: any) => {
        const av = (a[sortField] || '').toString().toLowerCase()
        const bv = (b[sortField] || '').toString().toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Assets</h1>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          placeholder="Search by name, person, or serial..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No assets match your search</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b">
                  {['name', 'category', 'assigned_to', 'status', 'warranty_expires'].map(f => (
                    <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200">
                      <span className="inline-flex items-center gap-1">
                        {f === 'warranty_expires' ? 'Warranty' : f === 'assigned_to' ? 'Assigned To' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {sortIcon(f)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100 font-medium">
                      <div className="flex items-center gap-2">
                        {categoryIcon(a.category)}
                        {a.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 capitalize">{a.category}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{a.assigned_to || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        a.status === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        a.status === 'lost' ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>{a.status}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{formatDate(a.warranty_expires)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400">
            <span>{sampleAssets.length} assets · Showing all</span>
          </div>
        </div>
      )}
    </div>
  )
}
