'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatDate, daysUntil } from '@/lib/utils'
import { Plus, Trash2, Upload, Download, Shield, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil, X } from 'lucide-react'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import { downloadCsv } from '@/lib/export'
import { getSettings } from '@/lib/settings-store'
import { getTeam, queryCerts, saveCert, deleteCert, getTeamSettings } from '@/lib/data'
import Link from 'next/link'

interface Cert { id: string; name: string; type: string; issuer: string; expires_at: string; notify_before_days: number; document?: string; docName?: string }

export default function CertsPage() {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamLoading, setTeamLoading] = useState(true)
  const [certs, setCerts] = useState<Cert[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<Cert | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cert | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [form, setForm] = useState({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30, document:'', docName:'' })
  const [uploading, setUploading] = useState(false)
  const [teamSettings, setTeamSettings] = useState<any>(null)

  // ── Multi-select ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function selectAll() {
    if (selectedIds.size === certs.length) { setSelectedIds(new Set()); return }
    setSelectedIds(new Set(certs.map(c => c.id)))
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} certificate${selectedIds.size > 1 ? 's' : ''}?`)) return
    for (const id of selectedIds) await deleteCert(id)
    setSelectedIds(new Set())
    await loadCerts()
  }
  const localSettings = getSettings()
  const settings = teamSettings || localSettings
  const certTypes = (settings.cert_types || ['ssl_cert','software_license','support_contract','domain','other']) as string[]

  // ── URL filter params ──
  const searchParams = useSearchParams()
  const showExpired = searchParams.get('expired') === 'true'
  const showExpiring = searchParams.get('expiring') === 'true'
  const activeFilter = showExpired ? 'expired' : showExpiring ? 'expiring' : null

  // ── Load team ──
  useEffect(() => {
    (async () => {
      const team = await getTeam()
      setTeamId(team?.id || null)
      if (team?.id) {
        const s = await getTeamSettings(team.id)
        if (s && Object.keys(s).length > 0) setTeamSettings(s)
      }
      setTeamLoading(false)
    })()
  }, [])

  async function loadCerts() {
    if (!teamId) { setCerts([]); setLoading(false); return }
    const result = await queryCerts({ teamId, limit: 10000 })
    setCerts(result.data as Cert[])
    setLoading(false)
  }

  useEffect(() => {
    if (!teamLoading) loadCerts()
  }, [teamLoading])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowForm(true); setEditing(null)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId) return
    if (editing) await deleteCert(editing.id)
    await saveCert(form, teamId)
    await loadCerts()
    setShowForm(false); setEditing(null)
    setForm({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30, document:'', docName:'' })
  }

  function startEdit(c: Cert) {
    setEditing(c)
    setForm({ name:c.name, type:c.type, issuer:c.issuer||'', expires_at:c.expires_at, notify_before_days:c.notify_before_days||30, document:c.document||'', docName:c.docName||'' })
    setShowForm(true)
  }

  function downloadDoc(c: Cert) {
    if (!c.document) return
    const a = document.createElement('a')
    a.href = c.document; a.download = c.docName || c.name + '.pdf'; a.click()
  }

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function sortIcon(field: string) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const filtered = certs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (showExpired) return daysUntil(c.expires_at) <= 0
    if (showExpiring) return daysUntil(c.expires_at) <= 30 && daysUntil(c.expires_at) > 0
    return true
  })

  const sorted = sortField ? [...filtered].sort((a:any,b:any) => {
    const av = (a[sortField] || '').toString().toLowerCase()
    const bv = (b[sortField] || '').toString().toLowerCase()
    if (sortField === 'expires_at') {
      const ad = daysUntil(a.expires_at); const bd = daysUntil(b.expires_at)
      return sortDir === 'asc' ? ad - bd : bd - ad
    }
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  }) : filtered

  if (teamLoading || loading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading...</div>

  if (!teamId) return (
    <div className="text-center py-20">
      <Shield size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No team set up</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create or join a team to track certificates.</p>
      <Link href="/team" className="inline-block mt-4 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">Go to Team</Link>
    </div>
  )

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Certs &amp; Licenses</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Upload size={16}/>Import CSV</button>
        <button onClick={() => downloadCsv(certs, 'devicelog-certs.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={16}/>Export</button>
        <button onClick={()=>{setEditing(null); setForm({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30, document:'', docName:'' }); setShowForm(true)}} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400"><Plus size={16}/>Add Certificate</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"/><input placeholder="Search by name or issuer..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

    {activeFilter && (
      <div className="mb-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${activeFilter === 'expired' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'}`}>
          {activeFilter === 'expired' ? '⏰ Expired' : '⏳ Expiring within 30 days'}
          <Link href="/certificates" className="ml-1 hover:opacity-70"><X size={12} /></Link>
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{filtered.length} of {certs.length} certificates</span>
      </div>
    )}

    {showForm && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl"><h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Certificate' : 'New Certificate'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" placeholder="e.g. devicelog.com SSL"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm">{certTypes.map((t:string)=><option key={t} value={t}>{t.replace('_',' ')}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Issuer</label><input value={form.issuer} onChange={e=>setForm({...form,issuer:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" placeholder="e.g. Let's Encrypt"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Expires *</label><input required type="date" value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm"/></div>
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Notify (days before)</label><input type="number" value={form.notify_before_days} onChange={e=>setForm({...form,notify_before_days:parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm"/></div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Document (PDF)</label>
          {form.docName ? (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded text-sm">
              <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{form.docName}</span>
              <button onClick={() => { setForm({...form, document:'', docName:''}) }} className="text-red-400 hover:text-red-600 dark:text-red-400 text-xs">Remove</button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:border-cyan-300 hover:text-cyan-600 dark:text-cyan-400">
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                if (f.size > 500 * 1024) { alert('PDF too large. Max 500KB per file due to browser storage limits.'); return }
                setUploading(true)
                const reader = new FileReader()
                reader.onload = () => { setForm({...form, document: reader.result as string, docName: f.name}); setUploading(false) }
                reader.readAsDataURL(f)
              }} />
            </label>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Max 500KB per file (browser storage limit)</p>
        </div>
        {uploading && <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full animate-pulse w-2/3" /></div>}
        <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">{editing?'Save Changes':'Add'}</button><button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button></div>
      </form></div></div>}

    {showImport && <CsvImport
      title="Import Certificates"
      description="Upload a CSV with name, type, issuer, expiry. We'll try to match columns."
      sampleData={`name,type,issuer,expires_at
devicelog.com SSL,ssl_cert,Let's Encrypt,2027-06-15
Office 365,software_license,Microsoft,2026-12-31`}
      sampleFilename="certs.csv"
      onImport={async rows => {
        if (!teamId) return
        const existingNames = new Set(certs.map(c => c.name.toLowerCase()))
        const newCerts: any[] = []
        let skipped = 0
        for (const r of rows) {
          const name = r.name || r.cert_name || r.domain || 'Unknown'
          if (existingNames.has(name.toLowerCase())) { skipped++; continue }
          existingNames.add(name.toLowerCase())
          newCerts.push({
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            name,
            type: (r.type || 'ssl_cert').toLowerCase().replace(' ','_'),
            issuer: r.issuer || '',
            expires_at: r.expires_at || r.expires || r.expiry || '',
            notify_before_days: parseInt(r.notify_before_days) || 30,
          })
        }
        if (newCerts.length === 0) { alert('All rows are duplicates — nothing imported.'); setShowImport(false); return }
        for (const c of newCerts) await saveCert(c, teamId)
        await loadCerts()
        setShowImport(false)
        if (skipped > 0) alert(`Imported ${newCerts.length} certificates. Skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}.`)
      }}
      onClose={() => setShowImport(false)}
    />}

    {deleteTarget && <ConfirmDialog
      title={`Delete ${deleteTarget.name}?`}
      message="This permanently removes the certificate from your tracking."
      confirmLabel="Delete"
      onConfirm={async () => { await deleteCert(deleteTarget.id); await loadCerts(); setDeleteTarget(null) }}
      onCancel={() => setDeleteTarget(null)}
    />}

    {certs.length===0 ? <div className="text-center py-16 text-slate-400 dark:text-slate-500"><Shield size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No certificates yet</p><p className="text-sm mt-1">Track SSL certs, software licenses, and support contracts</p></div> :
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-cyan-50 dark:bg-cyan-950 border-b border-cyan-200 dark:border-cyan-800 text-sm">
          <span className="text-cyan-800 dark:text-cyan-200 font-medium">{selectedIds.size} selected</span>
          <button onClick={bulkDelete} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-400">Clear</button>
        </div>
      )}
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b">
              <th className="py-3 px-4 w-10">
                <input type="checkbox" checked={selectedIds.size === certs.length && certs.length > 0} onChange={selectAll} className="rounded border-slate-300" />
              </th>
              {['name','type','issuer','expires_at'].map(f => (
                <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:text-slate-200">
                  <span className="inline-flex items-center gap-1">{f==='expires_at' ? 'Expires' : f.charAt(0).toUpperCase()+f.slice(1)}{sortIcon(f)}</span>
                </th>
              ))}
              <th className="py-3 px-4 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const d = daysUntil(c.expires_at)
              return (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="py-2.5 px-4">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300" />
                  </td>
                  <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100 font-medium">{c.name}</td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 capitalize">{c.type.replace('_',' ')}</td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{c.issuer||'—'}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${d<=0?'text-red-600 dark:text-red-400':d<=30?'text-amber-600 dark:text-amber-400':'text-slate-600 dark:text-slate-400'}`}>
                      {d<=0?'EXPIRED':d<=30?`${d}d left`:formatDate(c.expires_at)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-1">
                      {c.document && <button onClick={() => downloadDoc(c)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="Download PDF"><Download size={14} className="text-slate-400 dark:text-slate-500"/></button>}
                      <button onClick={() => startEdit(c)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={14} className="text-slate-400 dark:text-slate-500"/></button>
                      <button onClick={()=>setDeleteTarget(c)} className="p-1 hover:bg-red-50 dark:bg-red-950 rounded"><Trash2 size={14} className="text-red-400"/></button>
                    </div>
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
