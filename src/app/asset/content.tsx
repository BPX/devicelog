'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, MapPin, User } from 'lucide-react'

interface Asset { id: string; name: string; category: string; manufacturer: string; model: string; serial_number: string; status: string; assigned_to: string; location: string; purchase_date: string | null; warranty_expires: string | null; image?: string }

export default function AssetPageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [asset, setAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (!id) return
    try {
      const assets: Asset[] = JSON.parse(localStorage.getItem('trackstack_assets') || '[]')
      setAsset(assets.find(a => a.id === id) || null)
    } catch {}
  }, [id])

  if (!id) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">No asset ID provided</div>
  if (!asset) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Asset not found</div>

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex justify-center">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        {asset.image && <img src={asset.image} alt={asset.name} className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-200" />}
        <div className="flex items-start justify-between mb-6">
          <div><h1 className="text-xl font-semibold text-slate-900">{asset.name}</h1><p className="text-sm text-slate-500">{asset.manufacturer} {asset.model}</p></div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${asset.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{asset.status}</span>
        </div>
        <div className="space-y-3 mb-6">
          {asset.serial_number && <div className="flex items-center gap-3 text-sm"><span className="text-slate-400 w-24">Serial</span><span className="font-mono text-slate-700">{asset.serial_number}</span></div>}
          {asset.assigned_to && <div className="flex items-center gap-3 text-sm"><User size={14} className="text-slate-400" /><span className="text-slate-700">{asset.assigned_to}</span></div>}
          {asset.location && <div className="flex items-center gap-3 text-sm"><MapPin size={14} className="text-slate-400" /><span className="text-slate-700">{asset.location}</span></div>}
          {asset.warranty_expires && <div className="flex items-center gap-3 text-sm"><Calendar size={14} className="text-slate-400" /><span className="text-slate-700">Warranty: {new Date(asset.warranty_expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
          {asset.purchase_date && <div className="flex items-center gap-3 text-sm"><Calendar size={14} className="text-slate-400" /><span className="text-slate-700">Purchased: {new Date(asset.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
        </div>
        <div className="border-t pt-4"><p className="text-xs text-slate-400 text-center">Trackstack Asset</p></div>
      </div>
    </div>
  )
}
