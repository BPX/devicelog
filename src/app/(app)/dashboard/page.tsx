'use client'
import { useEffect, useState } from 'react'
import { Package, Shield, AlertTriangle, RefreshCw, Users } from 'lucide-react'
import { daysUntil } from '@/lib/utils'
import { getTeam, queryAssets, queryCerts, queryEmployees } from '@/lib/data'
import type { Asset } from '@/lib/data'
import Link from 'next/link'

interface CertSummary { id: string; name: string; type: string; expires_at: string }

const cardLink = 'rounded-lg p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all'

export default function DashboardPage() {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [certs, setCerts] = useState<CertSummary[]>([])
  const [employeeCount, setEmployeeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const team = await getTeam()
        const tid = team?.id || null
        setTeamId(tid)

        if (tid) {
          const [assetResult, certResult, empResult] = await Promise.all([
            queryAssets({ teamId: tid, limit: 10000 }),
            queryCerts({ teamId: tid, limit: 10000 }),
            queryEmployees({ teamId: tid, limit: 10000 }),
          ])
          setAssets(assetResult.data)
          setCerts(certResult.data as CertSummary[])
          setEmployeeCount(empResult.total)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard')
      }
      setLoading(false)
    }
    load()
  }, [])

  const expiringSoon = certs.filter(c => daysUntil(c.expires_at) <= 30 && daysUntil(c.expires_at) > 0).length
  const expired = certs.filter(c => daysUntil(c.expires_at) <= 0).length
  const warrantyExpiring = assets.filter(a => a.warranty_expires && daysUntil(a.warranty_expires) <= 30 && daysUntil(a.warranty_expires) > 0).length
  const warrantyExpired = assets.filter(a => a.warranty_expires && daysUntil(a.warranty_expires) <= 0).length

  if (loading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading...</div>

  if (error) return (
    <div className="p-8 text-center">
      <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Could not load dashboard</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  )

  if (!teamId) return (
    <div className="text-center py-20">
      <Package size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No team set up</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create or join a team to see your dashboard.</p>
      <Link href="/team" className="inline-block mt-4 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">Go to Team</Link>
    </div>
  )

  const stats = [
    { label: 'Total Assets', value: assets.length, icon: Package, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950', href: '/assets' },
    { label: 'Active Certs', value: certs.length, icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950', href: '/certificates' },
    { label: 'Employees', value: employeeCount, icon: Users, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950', href: '/employees' },
    { label: 'Expiring Soon', value: expiringSoon, icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950', href: '/certificates?expiring=true' },
    { label: 'Expired', value: expired, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', href: '/certificates?expired=true' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Dashboard</h1>
      {(expired > 0 || warrantyExpired > 0) && <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
        <span className="text-red-800">
          {expired > 0 && <>{expired} cert{expired>1?'s':''} expired. </>}
          {warrantyExpired > 0 && <>{warrantyExpired} warrant{warrantyExpired>1?'ies':'y'} expired. </>}
          <Link href="/certificates?expired=true" className="underline font-medium">Review now →</Link>
        </span>
      </div>}
      {(expiringSoon > 0 || warrantyExpiring > 0) && (expired === 0 && warrantyExpired === 0) && <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 rounded-lg text-sm">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
        <span className="text-amber-800">
          {expiringSoon > 0 && <>{expiringSoon} cert{expiringSoon>1?'s':''} expiring soon. </>}
          {warrantyExpiring > 0 && <>{warrantyExpiring} warrant{warrantyExpiring>1?'ies':'y'} expiring soon. </>}
          <Link href="/certificates?expiring=true" className="underline font-medium">Review now →</Link>
        </span>
      </div>}

      <div className="grid grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className={`${s.bg} ${cardLink}`}>
            <div className="flex items-center gap-2 mb-2"><s.icon size={18} className={s.color} /><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span></div>
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4"><h2 className="font-medium text-slate-900 dark:text-slate-100">Recent Assets</h2><Link href="/assets" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View all</Link></div>
          {assets.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No assets yet. <Link href="/assets" className="text-cyan-600 dark:text-cyan-400">Add your first</Link></p> : <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 dark:text-slate-400 border-b"><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Category</th><th className="pb-2 font-medium">Status</th></tr></thead><tbody>{assets.slice(0,5).map(a => <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-2 text-slate-900 dark:text-slate-100">{a.name}</td><td className="py-2 text-slate-500 dark:text-slate-400 capitalize">{a.category}</td><td className="py-2"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status==='active'?'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300':'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{a.status}</span></td></tr>)}</tbody></table>}
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4"><h2 className="font-medium text-slate-900 dark:text-slate-100">Upcoming Expirations</h2><Link href="/certificates?expiring=true" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View all</Link></div>
          {certs.filter(c => daysUntil(c.expires_at) <= 30).length === 0 ? <div className="text-center py-8 text-slate-400 dark:text-slate-500"><Shield size={32} className="mx-auto mb-2" /><p className="text-sm">All clear — nothing expiring soon</p></div> : <div className="space-y-2">{certs.filter(c => daysUntil(c.expires_at) <= 30).map(c => { const days = daysUntil(c.expires_at); return <div key={c.id} className={`flex justify-between items-center p-3 rounded text-sm ${days<=0?'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300':'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}><span className="font-medium">{c.name}</span><span>{days<=0?'EXPIRED':`${days} days`}</span></div>})}</div>}
        </div>
      </div>
    </div>
  )
}
