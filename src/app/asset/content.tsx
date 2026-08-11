'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, MapPin, User, AlertTriangle, Send, ExternalLink, Package } from 'lucide-react'
import Link from 'next/link'

const SUPABASE_URL = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

interface Asset { id: string; name: string; category: string; manufacturer: string; model: string; serial_number: string; status: string; assigned_to: string; location: string; purchase_date: string | null; warranty_expires: string | null; image?: string }

export default function AssetPageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/assets?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    })
      .then(r => r.json())
      .then(data => { setAsset(data?.[0] || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  function reportIssue() {
    const subject = encodeURIComponent(`Issue with ${asset?.name || 'asset'} (${asset?.serial_number || 'N/A'})`)
    window.location.href = `mailto:hello@devicelog.dev?subject=${subject}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">Loading...</div>
  if (!id) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">No asset ID provided</div>
  if (!asset) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Asset not found</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">This QR code may be for a deleted asset.</p>
        <Link href="/" className="inline-block mt-4 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">Go to devicelog</Link>
      </div>
    </div>
  )

  const warrantyStatus = asset.warranty_expires
    ? new Date(asset.warranty_expires) < new Date()
      ? 'expired'
      : new Date(asset.warranty_expires) < new Date(Date.now() + 30 * 86400000)
        ? 'expiring'
        : 'active'
    : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 flex justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Photo */}
        {asset.image && <img src={asset.image} alt={asset.name} className="w-full h-48 object-cover border-b border-slate-200 dark:border-slate-800" />}

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{asset.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{asset.manufacturer} {asset.model}</p>
            </div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
              asset.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
              asset.status === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
              asset.status === 'planned' ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>{asset.status}</span>
          </div>

          {/* Details */}
          <div className="space-y-2.5 mb-6">
            {asset.serial_number && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Serial</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{asset.serial_number}</span>
              </div>
            )}
            {asset.assigned_to && (
              <div className="flex items-center gap-3 text-sm">
                <User size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{asset.assigned_to}</span>
              </div>
            )}
            {asset.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{asset.location}</span>
              </div>
            )}
            {asset.warranty_expires && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Warranty {warrantyStatus === 'expired' ? 'expired' : warrantyStatus === 'expiring' ? 'expires soon: ' : 'until: '}
                  {new Date(asset.warranty_expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {warrantyStatus === 'expired' && <span className="text-xs text-red-500 dark:text-red-400 font-medium">Expired</span>}
                {warrantyStatus === 'expiring' && <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">Soon</span>}
              </div>
            )}
            {asset.purchase_date && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Purchased: {new Date(asset.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <button onClick={reportIssue} className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              <AlertTriangle size={14} /> Report an issue
            </button>
            {!asset.assigned_to && (
              <a href={`mailto:hello@devicelog.dev?subject=${encodeURIComponent(`Request: ${asset.name}`)}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-600 dark:bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors">
                <Send size={14} /> Request this asset
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">Tracked with devicelog</span>
          <a href="https://devicelog.dev" target="_blank" rel="noopener" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
            devicelog.dev <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}