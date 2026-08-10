'use client'
import { useState } from 'react'
import { formatDate, daysUntil } from '@/lib/utils'
import { Search, Shield, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface Cert {
  id: string; name: string; type: string; issuer: string; expires_at: string
}

const sampleCerts: Cert[] = [
  { id: 'c1', name: 'trackstack.com SSL', type: 'ssl_cert', issuer: "Let's Encrypt", expires_at: '2027-06-15' },
  { id: 'c2', name: 'api.trackstack.dev SSL', type: 'ssl_cert', issuer: "Let's Encrypt", expires_at: '2027-04-03' },
  { id: 'c3', name: 'Office 365 E5', type: 'software_license', issuer: 'Microsoft', expires_at: '2026-12-31' },
  { id: 'c4', name: 'JetBrains All Products Pack', type: 'software_license', issuer: 'JetBrains', expires_at: '2026-08-01' },
  { id: 'c5', name: 'Slack Enterprise Grid', type: 'software_license', issuer: 'Slack', expires_at: '2027-01-15' },
  { id: 'c6', name: 'Cisco Meraki MX95 Support', type: 'support_contract', issuer: 'Cisco', expires_at: '2026-04-20' },
  { id: 'c7', name: 'Vercel Pro', type: 'software_license', issuer: 'Vercel', expires_at: '2026-09-30' },
  { id: 'c8', name: '1Password Business', type: 'software_license', issuer: '1Password', expires_at: '2027-03-01' },
  { id: 'c9', name: 'Figma Enterprise', type: 'software_license', issuer: 'Figma', expires_at: '2027-01-10' },
  { id: 'c10', name: 'AWS Business Support', type: 'support_contract', issuer: 'Amazon Web Services', expires_at: '2026-11-15' },
  { id: 'c11', name: 'GitHub Enterprise Cloud', type: 'software_license', issuer: 'GitHub', expires_at: '2027-05-30' },
  { id: 'c12', name: 'Datadog Pro', type: 'software_license', issuer: 'Datadog', expires_at: '2026-10-01' },
  { id: 'c13', name: 'internal.trackstack.dev SSL', type: 'ssl_cert', issuer: "Let's Encrypt", expires_at: '2027-05-20' },
  { id: 'c14', name: 'Google Workspace Enterprise', type: 'software_license', issuer: 'Google', expires_at: '2027-08-01' },
]

export default function DemoCertificates() {
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

  const filtered = sampleCerts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = sortField
    ? [...filtered].sort((a: any, b: any) => {
        if (sortField === 'expires_at') {
          const ad = daysUntil(a.expires_at)
          const bd = daysUntil(b.expires_at)
          return sortDir === 'asc' ? ad - bd : bd - ad
        }
        const av = (a[sortField] || '').toString().toLowerCase()
        const bv = (b[sortField] || '').toString().toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Certs &amp; Licenses</h1>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search by name or issuer..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Shield size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No certificates match your search</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-[calc(100vh-220px)] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-slate-500 bg-slate-50 border-b">
                  {['name', 'type', 'issuer', 'expires_at'].map(f => (
                    <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        {f === 'expires_at' ? 'Expires' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {sortIcon(f)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const d = daysUntil(c.expires_at)
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-900 font-medium">{c.name}</td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">{c.type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 text-slate-500">{c.issuer || '—'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          d <= 0 ? 'text-red-600' : d <= 30 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {d <= 0 ? 'EXPIRED' : d <= 30 ? `${d}d left` : formatDate(c.expires_at)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span>{sampleCerts.length} certificates</span>
          </div>
        </div>
      )}
    </div>
  )
}
