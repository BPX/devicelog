'use client'
import { useEffect, useState } from 'react'
import { Package, Shield, AlertTriangle } from 'lucide-react'
import { daysUntil } from '@/lib/utils'
import Link from 'next/link'

interface Asset { id: string; name: string; category: string; status: string; warranty_expires: string | null }
interface Cert { id: string; name: string; type: string; expires_at: string }

function getStore(key: string) { try { return JSON.parse(localStorage.getItem('trackstack_' + key) || '[]') } catch { return [] } }
function setStore(key: string, data: any) { localStorage.setItem('trackstack_' + key, JSON.stringify(data)) }

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]); const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { setAssets(getStore('assets')); setCerts(getStore('certificates')); setLoading(false) }, [])

  const expiringSoon = certs.filter(c => daysUntil(c.expires_at) <= 30 && daysUntil(c.expires_at) > 0).length
  const expired = certs.filter(c => daysUntil(c.expires_at) <= 0).length

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[{ label: 'Total Assets', value: assets.length, icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50' },{ label: 'Active Certs', value: certs.length, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },{ label: 'Expiring Soon', value: expiringSoon, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },{ label: 'Expired', value: expired, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-5 border border-slate-200`}>
            <div className="flex items-center gap-2 mb-2"><s.icon size={18} className={s.color} /><span className="text-sm text-slate-600">{s.label}</span></div>
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4"><h2 className="font-medium text-slate-900">Recent Assets</h2><Link href="/assets" className="text-sm text-cyan-600 hover:underline">View all</Link></div>
          {assets.length === 0 ? <p className="text-sm text-slate-500">No assets yet. <Link href="/assets" className="text-cyan-600">Add your first</Link></p> : <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b"><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Category</th><th className="pb-2 font-medium">Status</th></tr></thead><tbody>{assets.slice(0,5).map(a => <tr key={a.id} className="border-b border-slate-100"><td className="py-2 text-slate-900">{a.name}</td><td className="py-2 text-slate-500 capitalize">{a.category}</td><td className="py-2"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status==='active'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{a.status}</span></td></tr>)}</tbody></table>}
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4"><h2 className="font-medium text-slate-900">Upcoming Expirations</h2><Link href="/certificates" className="text-sm text-cyan-600 hover:underline">View all</Link></div>
          {certs.filter(c => daysUntil(c.expires_at) <= 30).length === 0 ? <div className="text-center py-8 text-slate-400"><Shield size={32} className="mx-auto mb-2" /><p className="text-sm">All clear — nothing expiring soon</p></div> : <div className="space-y-2">{certs.filter(c => daysUntil(c.expires_at) <= 30).map(c => { const days = daysUntil(c.expires_at); return <div key={c.id} className={`flex justify-between items-center p-3 rounded text-sm ${days<=0?'bg-red-50 text-red-700':'bg-amber-50 text-amber-700'}`}><span className="font-medium">{c.name}</span><span>{days<=0?'EXPIRED':`${days} days`}</span></div>})}</div>}
        </div>
      </div>
    </div>
  )
}
