'use client'
import { Package, Shield, AlertTriangle, Users } from 'lucide-react'
import Link from 'next/link'
import { daysUntil } from '@/lib/utils'

// ── Sample data ──

const stats = [
  { label: 'Total Assets', value: 247, icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Active Certs', value: 38, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Team Members', value: 12, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Expiring Soon', value: 5, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const recentAssets = [
  { name: 'MacBook Pro 14" M3', category: 'laptop', status: 'active' },
  { name: 'Dell XPS 15 9530', category: 'laptop', status: 'active' },
  { name: 'ThinkPad X1 Carbon Gen 12', category: 'laptop', status: 'active' },
  { name: 'Dell UltraSharp U2723QE', category: 'monitor', status: 'active' },
  { name: 'HP LaserJet Pro M404', category: 'printer', status: 'maintenance' },
]

const expiringCerts = [
  { name: 'Cisco Meraki MX95 Support', type: 'support_contract', expires_at: '2026-04-20' },
  { name: 'JetBrains All Products Pack', type: 'software_license', expires_at: '2026-08-01' },
  { name: 'trackstack.com SSL', type: 'ssl_cert', expires_at: '2027-06-15' },
]

export default function DemoDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>

      {(expiringCerts.some(c => daysUntil(c.expires_at) <= 0)) && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-red-800">1 cert expired. 1 warranty expired. <Link href="/demo/certificates" className="underline font-medium">Review now →</Link></span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-5 border border-slate-200`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={18} className={s.color} />
              <span className="text-sm text-slate-600">{s.label}</span>
            </div>
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-slate-900">Recent Assets</h2>
            <Link href="/demo/assets" className="text-sm text-cyan-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map(a => (
                <tr key={a.name} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">{a.name}</td>
                  <td className="py-2 text-slate-500 capitalize">{a.category}</td>
                  <td className="py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-slate-900">Upcoming Expirations</h2>
            <Link href="/demo/certificates" className="text-sm text-cyan-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {expiringCerts.map(c => {
              const days = daysUntil(c.expires_at)
              return (
                <div key={c.name} className={`flex justify-between items-center p-3 rounded text-sm ${days <= 0 ? 'bg-red-50 text-red-700' : days <= 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'}`}>
                  <span className="font-medium">{c.name}</span>
                  <span>{days <= 0 ? 'EXPIRED' : `${days} days`}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
