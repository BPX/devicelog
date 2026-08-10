'use client'
import { useState } from 'react'
import { getSettings, saveSettings, type AppSettings } from '@/lib/settings-store'
import { Plus, X } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings())
  const [saved, setSaved] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newCertType, setNewCertType] = useState('')

  function persist(updated: AppSettings) { setSettings(updated); saveSettings(updated) }

  function addItem(field: 'categories'|'statuses'|'cert_types', value: string) {
    if (!value.trim()) return
    if (!settings[field].includes(value.trim())) {
      persist({ ...settings, [field]: [...settings[field], value.trim()].sort() })
    }
  }

  function removeItem(field: 'categories'|'statuses'|'cert_types', value: string) {
    persist({ ...settings, [field]: settings[field].filter(v => v !== value) })
  }

  function save() { saveSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (<div>
    <h1 className="text-2xl font-semibold text-slate-900 mb-6">Settings</h1>
    <div className="max-w-2xl space-y-8">

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-medium text-slate-900 mb-1">Asset Categories</h2>
        <p className="text-sm text-slate-500 mb-4">Customize the categories you track</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.categories.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
              {c} <button onClick={() => removeItem('categories', c)} className="hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('categories',newCat);setNewCat('')} }} />
          <button onClick={() => { addItem('categories', newCat); setNewCat('') }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-medium text-slate-900 mb-1">Asset Statuses</h2>
        <p className="text-sm text-slate-500 mb-4">Custom statuses like "In Repair", "Decommissioned", "Ready to Deploy"</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.statuses.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
              {s} <button onClick={() => removeItem('statuses', s)} className="hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="New status..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('statuses',newStatus);setNewStatus('')} }} />
          <button onClick={() => { addItem('statuses', newStatus); setNewStatus('') }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-medium text-slate-900 mb-1">Certificate Types</h2>
        <p className="text-sm text-slate-500 mb-4">Custom types for tracking (SSL certs, software licenses, support contracts, etc.)</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.cert_types.map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
              {t.replace('_',' ')} <button onClick={() => removeItem('cert_types', t)} className="hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCertType} onChange={e => setNewCertType(e.target.value)} placeholder="ssl_cert / software_license..." className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" onKeyDown={e => { if(e.key==='Enter'){addItem('cert_types',newCertType);setNewCertType('')} }} />
          <button onClick={() => { addItem('cert_types', newCertType); setNewCertType('') }} className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"><Plus size={14} /></button>
        </div>
      </div>

      <button onClick={save} className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">{saved ? 'Saved!' : 'Save Settings'}</button>
    </div>
  </div>)
}
