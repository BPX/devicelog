'use client'
import { useEffect, useState } from 'react'
import { formatDate, daysUntil } from '@/lib/utils'
import { Plus, Trash2, Upload, Download, Shield } from 'lucide-react'
import CsvImport from '@/components/csv-import'
import { downloadCsv } from '@/lib/export'

interface Cert { id: string; name: string; type: string; issuer: string; expires_at: string; notify_before_days: number }
const types = ['ssl_cert','software_license','support_contract','domain','other']

function getCerts(): Cert[] { try { return JSON.parse(localStorage.getItem('trackstack_certificates') || '[]') } catch { return [] } }
function saveCerts(c: Cert[]) { localStorage.setItem('trackstack_certificates', JSON.stringify(c)) }

export default function CertsPage() {
  const [certs, setCerts] = useState<Cert[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30 })

  useEffect(() => { setCerts(getCerts()); setLoading(false) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const all = getCerts()
    all.push({ id: Date.now().toString(), ...form })
    saveCerts(all); setCerts(getCerts())
    setShowForm(false); setForm({ name:'', type:'ssl_cert', issuer:'', expires_at:'', notify_before_days:30 })
  }

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

    {showForm && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-md border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">New Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="e.g. trackstack.com SSL"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm">{types.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Issuer</label><input value={form.issuer} onChange={e=>setForm({...form,issuer:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="e.g. Let's Encrypt"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Expires *</label><input required type="date" value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Notify (days before)</label><input type="number" value={form.notify_before_days} onChange={e=>setForm({...form,notify_before_days:parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        </div>
        <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">Add</button><button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div>
      </form></div></div>}

    {showImport && <CsvImport
      title="Import Certificates"
      description="Upload a CSV with name, type, issuer, expiry. We'll try to match columns."
      sampleData="name,type,issuer,expires_at\ntrackstack.com SSL,ssl_cert,Let's Encrypt,2027-06-15\nOffice 365,software_license,Microsoft,2026-12-31"
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

    {certs.length===0 ? <div className="text-center py-16 text-slate-400"><Shield size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No certificates yet</p><p className="text-sm mt-1">Track SSL certs, software licenses, and support contracts</p></div> :
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-slate-500 bg-slate-50 border-b">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Issuer</th>
              <th className="py-3 px-4 font-medium">Expires</th>
              <th className="py-3 px-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {certs.map(c => {
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
                    <button onClick={()=>{if(!confirm('Delete?'))return;saveCerts(getCerts().filter(x=>x.id!==c.id));setCerts(getCerts())}} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button>
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
