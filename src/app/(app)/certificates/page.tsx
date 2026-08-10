'use client'
import { useEffect, useState } from 'react'
import { formatDate, daysUntil } from '@/lib/utils'
import { Plus, Trash2, Upload, Download, Shield, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import { downloadCsv } from '@/lib/export'
import { getSettings } from '@/lib/settings-store'

interface Cert { id: string; name: string; type: string; issuer: string; expires_at: string; notify_before_days: number; document?: string }

function getCerts(): Cert[] { try { return JSON.parse(localStorage.getItem('trackstack_certificates') || '[]') } catch { return [] } }
function saveCerts(c: Cert[]) { localStorage.setItem('trackstack_certificates', JSON.stringify(c)) }

export default function CertsPage() {
  const [certs, setCerts] = useState<Cert[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [showImport, setShowImport] = useState(false)
  const [deleteCert, setDeleteCert] = useState<Cert | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [form, setForm] = useState({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30, document:'' })
  const certTypes = getSettings().cert_types || ['ssl_cert','software_license','support_contract','domain','other']

  useEffect(() => { setCerts(getCerts()); setLoading(false)
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowForm(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const all = getCerts()
    all.push({ id: Date.now().toString(), ...form })
    saveCerts(all); setCerts(getCerts())
    setShowForm(false); setForm({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30, document:'' })
  }

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function sortIcon(field: string) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const filtered = certs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase()))

  const sorted = sortField ? [...filtered].sort((a:any,b:any) => {
    const av = (a[sortField] || '').toString().toLowerCase()
    const bv = (b[sortField] || '').toString().toLowerCase()
    if (sortField === 'expires_at') {
      const ad = daysUntil(a.expires_at); const bd = daysUntil(b.expires_at)
      return sortDir === 'asc' ? ad - bd : bd - ad
    }
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  }) : filtered

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Certs &amp; Licenses</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={16}/>Import CSV</button>
        <button onClick={() => downloadCsv(certs, 'trackstack-certs.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Download size={16}/>Export</button>
        <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Certificate</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search by name or issuer..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

    {showForm && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-md border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">New Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="e.g. trackstack.com SSL"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm">{certTypes.map((t:string)=><option key={t} value={t}>{t.replace('_',' ')}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Issuer</label><input value={form.issuer} onChange={e=>setForm({...form,issuer:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="e.g. Let's Encrypt"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Expires *</label><input required type="date" value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Notify (days before)</label><input type="number" value={form.notify_before_days} onChange={e=>setForm({...form,notify_before_days:parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Document (PDF)</label>
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded text-sm text-slate-500 cursor-pointer hover:border-cyan-300 hover:text-cyan-600">
            <Upload size={14} /> Upload PDF
            <input type="file" accept=".pdf" className="hidden" onChange={e => {
              const f = e.target.files?.[0]
              if (!f) return
              const reader = new FileReader()
              reader.onload = () => setForm({...form, document: reader.result as string})
              reader.readAsDataURL(f)
            }} />
          </label>
        </div>
        <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">Add</button><button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div>
      </form></div></div>}

    {showImport && <CsvImport
      title="Import Certificates"
      description="Upload a CSV with name, type, issuer, expiry. We'll try to match columns."
      sampleData={`name,type,issuer,expires_at
trackstack.com SSL,ssl_cert,Let's Encrypt,2027-06-15
Office 365,software_license,Microsoft,2026-12-31`}
      sampleFilename="certs.csv"
      onImport={rows => {
        const newCerts = rows.map(r => ({
          id: Date.now().toString()+Math.random().toString(36).slice(2,6),
          name: r.name || r.cert_name || r.domain || 'Unknown',
          type: (r.type || 'ssl_cert').toLowerCase().replace(' ','_'),
          issuer: r.issuer || '',
          expires_at: r.expires_at || r.expires || r.expiry || '',
          notify_before_days: parseInt(r.notify_before_days) || 30,
        }))
        saveCerts([...getCerts(), ...newCerts]); setCerts(getCerts()); setShowImport(false)
      }}
      onClose={() => setShowImport(false)}
    />}

    {deleteCert && <ConfirmDialog
      title={`Delete ${deleteCert.name}?`}
      message="This permanently removes the certificate from your tracking."
      confirmLabel="Delete"
      onConfirm={() => { saveCerts(getCerts().filter(x=>x.id!==deleteCert.id)); setCerts(getCerts()); setDeleteCert(null) }}
      onCancel={() => setDeleteCert(null)}
    />}

    {certs.length===0 ? <div className="text-center py-16 text-slate-400"><Shield size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No certificates yet</p><p className="text-sm mt-1">Track SSL certs, software licenses, and support contracts</p></div> :
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-slate-500 bg-slate-50 border-b">
              {['name','type','issuer','expires_at'].map(f => (
                <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                  <span className="inline-flex items-center gap-1">{f==='expires_at' ? 'Expires' : f.charAt(0).toUpperCase()+f.slice(1)}{sortIcon(f)}</span>
                </th>
              ))}
              <th className="py-3 px-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const d = daysUntil(c.expires_at)
              return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-900 font-medium">{c.name}</td>
                  <td className="py-2.5 px-4 text-slate-500 capitalize">{c.type.replace('_',' ')}</td>
                  <td className="py-2.5 px-4 text-slate-500">{c.issuer||'—'}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${d<=0?'text-red-600':d<=30?'text-amber-600':'text-slate-600'}`}>
                      {d<=0?'EXPIRED':d<=30?`${d}d left`:formatDate(c.expires_at)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <button onClick={()=>setDeleteCert(c)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>}
  </div>)
}
