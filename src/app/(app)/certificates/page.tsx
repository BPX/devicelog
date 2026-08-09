'use client'
import { useEffect, useState } from 'react'
import { formatDate, daysUntil } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface Cert { id: string; name: string; type: string; issuer: string; expires_at: string; notify_before_days: number }
const types = ['ssl_cert','software_license','support_contract','domain','other']

function getCerts(): Cert[] { try { return JSON.parse(localStorage.getItem('trackstack_certificates') || '[]') } catch { return [] } }
function saveCerts(c: Cert[]) { localStorage.setItem('trackstack_certificates', JSON.stringify(c)) }

export default function CertsPage() {
  const [certs, setCerts] = useState<Cert[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
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
    <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-semibold text-slate-900">Certificates & Licenses</h1><button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Certificate</button></div>

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
        <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">Add</button><button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded text-sm text-slate-600">Cancel</button></div>
      </form></div></div>}

    {certs.length===0 ? <div className="text-center py-16 text-slate-400"><p className="text-lg font-medium">No certificates yet</p><p className="text-sm mt-1">Track SSL certs, software licenses, and support contracts</p></div> :
    <div className="space-y-2">{certs.map(c=>{const d=daysUntil(c.expires_at);return <div key={c.id} className={`flex items-center justify-between p-4 rounded-lg border ${d<=0?'bg-red-50 border-red-200':d<=30?'bg-amber-50 border-amber-200':'bg-white border-slate-200'}`}><div><div className="font-medium text-slate-900">{c.name}</div><div className="text-xs text-slate-500 mt-0.5">{c.type.replace('_',' ')}{c.issuer?` · ${c.issuer}`:''}</div></div><div className="flex items-center gap-4"><div className={`text-sm font-medium ${d<=0?'text-red-600':d<=30?'text-amber-600':'text-slate-600'}`}>{d<=0?'EXPIRED':d<=30?`${d} days left`:formatDate(c.expires_at)}</div><button onClick={()=>{if(!confirm('Delete?'))return;saveCerts(getCerts().filter(x=>x.id!==c.id));setCerts(getCerts())}} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button></div></div>})}</div>}
  </div>)
}
